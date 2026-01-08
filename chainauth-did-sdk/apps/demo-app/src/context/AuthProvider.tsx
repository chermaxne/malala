// AuthProvider.tsx - Context provider for shared authentication state
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ChainAuthSDK } from '@chainauth/sdk';
import { Wallet } from 'xrpl';
import { DEMO_CONFIG } from '../config/demo';

export type AuthState = 'idle' | 'connecting' | 'signing' | 'authenticated';

interface UserData {
  did: string;
  address: string;
  publicKey: string;
  wallet?: Wallet;
}

interface AuthContextType {
  authState: AuthState;
  isAuthenticated: boolean;
  userData: UserData | null;
  sdk: ChainAuthSDK | null;
  login: () => Promise<UserData>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sdk, setSdk] = useState<ChainAuthSDK | null>(null);

  // Initialize SDK on mount (only if not using mock data)
  useEffect(() => {
    if (DEMO_CONFIG.USE_MOCK_DATA) {
      console.log('Running in MOCK mode - fast demo without blockchain');
      return;
    }

    const initSDK = async () => {
      try {
        const chainAuthSDK = new ChainAuthSDK({
          xrplServerUrl: DEMO_CONFIG.XRPL_SERVER,
          network: 'testnet'
        });
        
        await chainAuthSDK.connect();
        setSdk(chainAuthSDK);
        console.log('ChainAuth SDK initialized and connected to', DEMO_CONFIG.XRPL_SERVER);
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
      }
    };

    initSDK();

    return () => {
      if (sdk) {
        sdk.disconnect();
      }
    };
  }, []);

  const loginMock = async (): Promise<UserData> => {
    setAuthState('connecting');
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAuthState('signing');
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockAddress = 'rN7n7otQDd6FczFgLdlqtyMVrn3LNU8AqA';
    const mockUserData: UserData = {
      did: `did:xrpl:1:${mockAddress}`,
      address: mockAddress,
      publicKey: 'ED01FA53FA5A7E77798F882ECE20B1ABC00BB358A9E55A202D0D0676BD0CE37A63',
    };

    setUserData(mockUserData);
    setAuthState('authenticated');
    
    return mockUserData;
  };

  const loginReal = async (): Promise<UserData> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      setAuthState('connecting');
      
      const wallet = sdk.wallet.generateWallet();
      console.log('Generated wallet:', wallet.address);
      
      setAuthState('signing');
      
      // Fund the wallet on testnet
      try {
        await sdk.getXRPLClient().getClient().fundWallet(wallet);
        console.log('Wallet funded on testnet');
      } catch (fundError) {
        console.warn('Wallet funding failed:', fundError);
      }

      // Create DID on XRPL
      let didResult;
      try {
        const didDocumentUri = `https://chainauth.example.com/did/${wallet.address}`;
        didResult = await sdk.did.registerDID(wallet, didDocumentUri);
        console.log('DID registered:', didResult);
      } catch (didError) {
        console.warn('DID registration failed, using fallback:', didError);
        didResult = {
          did: `did:xrpl:1:${wallet.address}`,
          txHash: 'mock-hash'
        };
      }

      const newUserData: UserData = {
        did: didResult.did,
        address: wallet.address,
        publicKey: wallet.publicKey,
        wallet: wallet,
      };

      setUserData(newUserData);
      setAuthState('authenticated');
      
      return newUserData;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState('idle');
      throw error;
    }
  };

  const login = async (): Promise<UserData> => {
    try {
      if (DEMO_CONFIG.USE_MOCK_DATA) {
        console.log('Using MOCK login (fast demo)');
        return await loginMock();
      } else {
        console.log('Using REAL XRPL login');
        return await loginReal();
      }
    } catch (error) {
      setAuthState('idle');
      throw error;
    }
  };

  const logout = () => {
    setAuthState('idle');
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        isAuthenticated: authState === 'authenticated',
        userData,
        sdk,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider.tsx - Context provider for shared authentication state
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AuthState = 'idle' | 'connecting' | 'signing' | 'authenticated';

interface UserData {
  did: string;
  address: string;
  publicKey: string;
}

interface AuthContextType {
  authState: AuthState;
  isAuthenticated: boolean;
  userData: UserData | null;
  login: () => Promise<UserData>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [userData, setUserData] = useState<UserData | null>(null);

  const login = async () => {
    try {
      setAuthState('connecting');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAuthState('signing');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock user data - in real implementation, this comes from XRPL wallet
      const mockAddress = 'rN7n7otQDd6FczFgLdlqtyMVrn3LNU8AqA';
      const mockUserData: UserData = {
        did: `did:xrpl:${mockAddress}`,
        address: mockAddress,
        publicKey: 'ED01FA53FA5A7E77798F882ECE20B1ABC00BB358A9E55A202D0D0676BD0CE37A63',
      };

      setUserData(mockUserData);
      setAuthState('authenticated');
      
      return mockUserData;
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

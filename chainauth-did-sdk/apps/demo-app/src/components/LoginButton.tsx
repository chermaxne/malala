// LoginButton.tsx - UI component for authentication
import React from 'react';
import { Loader2, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, type AuthState } from '../context/AuthProvider';

const getButtonContent = (state: AuthState) => {
  switch (state) {
    case 'idle':
      return (
        <>
          <Shield className="w-5 h-5" />
          <span>Sign in with ChainAuth</span>
        </>
      );
    case 'connecting':
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting to XRPL...</span>
        </>
      );
    case 'signing':
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Signing transaction...</span>
        </>
      );
    case 'authenticated':
      return (
        <>
          <Check className="w-5 h-5" />
          <span>Authenticated</span>
        </>
      );
  }
};

const getButtonStyles = (state: AuthState) => {
  const baseStyles = "flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg";
  
  switch (state) {
    case 'idle':
      return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white`;
    case 'connecting':
    case 'signing':
      return `${baseStyles} bg-blue-500 text-white cursor-wait`;
    case 'authenticated':
      return `${baseStyles} bg-green-600 hover:bg-green-700 text-white cursor-default`;
  }
};

export const LoginButton: React.FC = () => {
  const { authState, login } = useAuth();

  const handleLogin = async () => {
    if (authState !== 'idle') return;

    try {
      const user = await login();
      toast.success('Successfully authenticated!', {
        description: `DID: ${user.did}`,
      });
    } catch (error) {
      toast.error('Authentication failed', {
        description: 'Please try again',
      });
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={authState !== 'idle'}
      className={`${getButtonStyles(authState)} hover:scale-105 active:scale-95`}
    >
      {getButtonContent(authState)}
    </button>
  );
};

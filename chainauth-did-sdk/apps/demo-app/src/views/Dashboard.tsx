// Dashboard.tsx - Main dashboard view
import React from 'react';
import { LoginButton } from '../components/LoginButton';
import { IdentityCard } from '../components/IdentityCard';
import { CredentialsWallet } from '../components/CredentialsWallet';
import { RecoverySetup } from '../components/RecoverySetup';
import { useAuth } from '../context/AuthProvider';
import { LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ChainAuth</h1>
                <p className="text-sm text-gray-500">Decentralized Identity on XRPL</p>
              </div>
            </div>
            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          // Login View
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to ChainAuth
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Experience seamless decentralized identity powered by XRPL 
              </p>
            </div>
            <LoginButton />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover-lift hover-glow">
                <div className="text-3xl mb-3 transition-transform duration-300 hover:scale-125 inline-block">🔐</div>
                <h3 className="font-semibold mb-2">W3C Compliant DIDs</h3>
                <p className="text-sm text-gray-600">XLS-40d standard implementation</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover-lift hover-glow">
                <div className="text-3xl mb-3 transition-transform duration-300 hover:scale-125 inline-block">📜</div>
                <h3 className="font-semibold mb-2">Verifiable Credentials</h3>
                <p className="text-sm text-gray-600">XLS-70d credential management</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover-lift hover-glow">
                <div className="text-3xl mb-3 transition-transform duration-300 hover:scale-125 inline-block">🛡️</div>
                <h3 className="font-semibold mb-2">Account Recovery</h3>
                <p className="text-sm text-gray-600">Multi-sig guardian protection</p>
              </div>
            </div>
          </div>
        ) : (
          // Authenticated Dashboard
          <div className="space-y-8">
            {/* Identity Section */}
            <section>
              <IdentityCard />
            </section>

            {/* Credentials Section */}
            <section>
              <CredentialsWallet />
            </section>

            {/* Recovery Section */}
            <section>
              <RecoverySetup />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>NUS Fintech Hackathon 2026 | Powered by XRPL</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

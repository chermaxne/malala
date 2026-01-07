// IdentityCard.tsx - Display user identity information
import React, { useState } from 'react';
import { Copy, Check, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthProvider';

export const IdentityCard: React.FC = () => {
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  if (!userData) return null;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const didDocument = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: userData.did,
    controller: userData.did,
    verificationMethod: [
      {
        id: `${userData.did}#keys-1`,
        type: 'Ed25519VerificationKey2020',
        controller: userData.did,
        publicKeyMultibase: userData.publicKey,
      },
    ],
    authentication: [`${userData.did}#keys-1`],
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Identity</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <Shield className="w-4 h-4" />
          W3C Compliant
        </div>
      </div>

      {/* DID Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Decentralized Identifier (DID)
        </label>
        <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <code className="flex-1 text-sm font-mono text-gray-800 break-all">
            {userData.did}
          </code>
          <button
            onClick={() => handleCopy(userData.did)}
            className="p-2 hover:bg-gray-200 rounded-md transition-all duration-200 hover:scale-110"
            title="Copy DID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Address Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          XRPL Address
        </label>
        <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <code className="flex-1 text-sm font-mono text-gray-800">
            {userData.address}
          </code>
          <button
            onClick={() => handleCopy(userData.address)}
            className="p-2 hover:bg-gray-200 rounded-md transition-all duration-200 hover:scale-110"
            title="Copy Address"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Raw Data Toggle */}
      <div>
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-3"
        >
          {showRawData ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showRawData ? 'Hide' : 'View'} DID Document
        </button>

        {showRawData && (
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 font-mono">
              {JSON.stringify(didDocument, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

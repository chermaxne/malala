// CredentialsWallet.tsx - Verifiable Credentials display and management
import React, { useState } from 'react';
import { Award, CheckCircle, Clock, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Credential {
  id: string;
  type: string;
  issuer: string;
  issuanceDate: string;
  status: 'verified' | 'pending' | 'revoked';
  claims: Record<string, any>;
}

const mockCredentials: Credential[] = [
  {
    id: 'vc-1',
    type: 'KYC Verified',
    issuer: 'did:xrpl:rKYCIssuer123...',
    issuanceDate: '2026-01-05',
    status: 'verified',
    claims: {
      name: 'John Doe',
      country: 'USA',
      verificationLevel: 'Level 2',
    },
  },
  {
    id: 'vc-2',
    type: 'Hackathon Participant',
    issuer: 'did:xrpl:rHackathonOrg456...',
    issuanceDate: '2026-01-07',
    status: 'verified',
    claims: {
      event: 'Fintech Hackathon 2026',
      role: 'Developer',
      team: 'ChainAuth',
    },
  },
  {
    id: 'vc-3',
    type: 'Age Verification',
    issuer: 'did:xrpl:rAgeVerifier789...',
    issuanceDate: '2026-01-06',
    status: 'pending',
    claims: {
      over18: true,
      over21: true,
    },
  },
];

export const CredentialsWallet: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>(mockCredentials);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);

  const handleAcceptCredential = async (credentialId: string) => {
    toast.info('Signing CredentialAccept transaction...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    setCredentials(prev =>
      prev.map(cred =>
        cred.id === credentialId ? { ...cred, status: 'verified' as const } : cred
      )
    );

    toast.success('Credential accepted!', {
      description: 'The credential is now verified on-ledger',
    });
  };

  const getStatusIcon = (status: Credential['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'revoked':
        return <Shield className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Credential['status']) => {
    const styles = {
      verified: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      revoked: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover-lift">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">Verifiable Credentials</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {credentials.map((credential) => (
          <div
            key={credential.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedCredential(credential)}
          >
            <div className="flex items-start justify-between mb-3">
              {getStatusIcon(credential.status)}
              {getStatusBadge(credential.status)}
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">{credential.type}</h3>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p className="truncate">Issuer: {credential.issuer}</p>
              <p>Issued: {credential.issuanceDate}</p>
            </div>

            {credential.status === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptCredential(credential.id);
                }}
                className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                Accept Credential
              </button>
            )}

            {credential.status === 'verified' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCredential(credential);
                }}
                className="mt-3 w-full px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Credential Detail Modal */}
      {selectedCredential && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCredential(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedCredential.type}</h3>
              <button
                onClick={() => setSelectedCredential(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <div>{getStatusBadge(selectedCredential.status)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Issuer DID</label>
                <code className="block text-sm bg-gray-50 p-2 rounded border border-gray-200">
                  {selectedCredential.issuer}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Issuance Date</label>
                <p className="text-sm text-gray-800">{selectedCredential.issuanceDate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Claims</label>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(selectedCredential.claims, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

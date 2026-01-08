// Demo configuration
export const DEMO_CONFIG = {
  // Set to true for fast mock demo, false for real XRPL integration
  USE_MOCK_DATA: false,
  
  // XRPL Network
  XRPL_SERVER: 'wss://s.altnet.rippletest.net:51233', // Testnet
  
  // Mock credentials for fast demo
  MOCK_CREDENTIALS: [
    {
      id: 'cred-1',
      type: 'KYCVerification',
      issuer: 'Singapore Financial Regulatory Authority',
      status: 'pending' as const,
      issuedDate: '2025-12-15',
      expiryDate: '2026-12-15',
      claims: {
        name: 'John Doe',
        jurisdiction: 'Singapore',
        kycLevel: 'Level 2',
        verifiedAt: '2025-12-15T10:30:00Z'
      }
    },
    {
      id: 'cred-2',
      type: 'HackathonParticipant',
      issuer: 'NUS Fintech Society',
      status: 'verified' as const,
      issuedDate: '2026-01-05',
      expiryDate: '2026-02-05',
      claims: {
        event: 'NUS Fintech Hackathon 2026',
        role: 'Participant',
        team: 'ChainAuth',
        track: 'DeFi Identity Solutions'
      }
    },
    {
      id: 'cred-3',
      type: 'AgeVerification',
      issuer: 'Singapore Government Digital Services',
      status: 'verified' as const,
      issuedDate: '2025-11-20',
      expiryDate: '2030-11-20',
      claims: {
        over18: true,
        over21: true,
        verificationMethod: 'Singpass'
      }
    }
  ]
};

// RecoverySetup.tsx - Guardian configuration and recovery simulation
import { useState } from 'react';
import { Users, Shield, AlertCircle, Key } from 'lucide-react';
import { toast } from 'sonner';

interface Guardian {
  address: string;
  name: string;
}

export const RecoverySetup = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([
    { address: '', name: '' },
    { address: '', name: '' },
    { address: '', name: '' },
  ]);
  const [quorum, setQuorum] = useState(2);
  const [isSetup, setIsSetup] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const handleGuardianChange = (index: number, field: 'address' | 'name', value: string) => {
    const newGuardians = [...guardians];
    newGuardians[index] = { ...newGuardians[index], [field]: value };
    setGuardians(newGuardians);
  };

  const handleSetupRecovery = async () => {
    const validGuardians = guardians.filter(g => g.address && g.name);
    
    if (validGuardians.length < 2) {
      toast.error('Please add at least 2 guardians');
      return;
    }

    if (quorum > validGuardians.length) {
      toast.error('Quorum cannot exceed number of guardians');
      return;
    }

    toast.info('Setting up recovery with SignerListSet...');
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSetup(true);
    toast.success('Recovery setup complete!', {
      description: `${validGuardians.length} guardians configured with ${quorum}/${validGuardians.length} threshold`,
    });
  };

  const handleSimulateRecovery = async () => {
    toast.info('Simulating account recovery...', {
      description: 'Requesting guardian signatures',
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info('Guardian 1 signed recovery transaction');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info('Guardian 2 signed recovery transaction');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Account recovered successfully!', {
      description: 'Your account has been restored with a new key',
      duration: 4000,
    });
    
    setShowRecovery(false);
  };

  const validGuardianCount = guardians.filter(g => g.address && g.name).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover-lift">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Recovery</h2>
          <p className="text-sm text-gray-600">Multi-Signature Guardian Setup</p>
        </div>
      </div>

      {/* Guardian Configuration */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Configure Guardians
        </h3>
        
        {guardians.map((guardian, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={`Guardian ${index + 1} Name`}
              value={guardian.name}
              onChange={(e) => handleGuardianChange(index, 'name', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder={`Guardian ${index + 1} XRPL Address (rXXX...)`}
              value={guardian.address}
              onChange={(e) => handleGuardianChange(index, 'address', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        ))}
      </div>

      {/* Threshold Slider */}
      <div className="mb-6">
        <label className="font-semibold text-gray-900 mb-3 block">
          Recovery Threshold: {quorum} of {validGuardianCount} signatures required
        </label>
        <input
          type="range"
          min="1"
          max={Math.max(validGuardianCount, 1)}
          value={quorum}
          onChange={(e) => setQuorum(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>{validGuardianCount}</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How Recovery Works</p>
          <p>If you lose access to your account, {quorum} of your {validGuardianCount} guardians must sign a transaction to restore access with a new key.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isSetup ? (
          <button
            onClick={handleSetupRecovery}
            disabled={validGuardianCount < 2}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Setup Recovery
          </button>
        ) : (
          <>
            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Recovery Configured</span>
            </div>
            <button
              onClick={() => setShowRecovery(true)}
              className="bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Key className="w-5 h-5" />
              Lost Key?
            </button>
          </>
        )}
      </div>

      {/* Recovery Simulation Modal */}
      {showRecovery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Simulate Account Recovery</h3>
            <p className="text-gray-600 mb-6">
              This will demonstrate how guardians can sign to recover your account with a new key.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSimulateRecovery}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700"
              >
                Start Recovery
              </button>
              <button
                onClick={() => setShowRecovery(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Trash2, RotateCcw, Zap, AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ThreatData, MitigationOption } from '../types';

interface QuarantineSystemProps {
  threats: ThreatData[];
  onQuarantine: (threatId: string) => Promise<boolean>;
  onRemove: (threatId: string) => Promise<boolean>;
  onRestore: (threatId: string) => Promise<boolean>;
  onMitigate: (threatId: string, mitigationId: string) => Promise<boolean>;
}

export const QuarantineSystem: React.FC<QuarantineSystemProps> = ({
  threats,
  onQuarantine,
  onRemove,
  onRestore,
  onMitigate
}) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showMitigation, setShowMitigation] = useState(false);

  const mitigationOptions: MitigationOption[] = [
    {
      id: 'isolate',
      name: 'Network Isolation',
      description: 'Block network access for the threat',
      severity: 'medium',
      automated: true,
      action: async () => true
    },
    {
      id: 'permissions',
      name: 'Revoke Permissions',
      description: 'Remove file execution permissions',
      severity: 'low',
      automated: true,
      action: async () => true
    },
    {
      id: 'registry',
      name: 'Registry Cleanup',
      description: 'Remove malicious registry entries',
      severity: 'high',
      automated: false,
      action: async () => true
    },
    {
      id: 'process',
      name: 'Kill Processes',
      description: 'Terminate associated processes',
      severity: 'high',
      automated: true,
      action: async () => true
    }
  ];

  const handleAction = async (action: string, threatId: string, mitigationId?: string) => {
    setIsProcessing(threatId);
    try {
      let success = false;
      switch (action) {
        case 'quarantine':
          success = await onQuarantine(threatId);
          break;
        case 'remove':
          success = await onRemove(threatId);
          break;
        case 'restore':
          success = await onRestore(threatId);
          break;
        case 'mitigate':
          if (mitigationId) success = await onMitigate(threatId, mitigationId);
          break;
      }
      if (success) setSelectedThreat(null);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'quarantined': return <Lock className="w-5 h-5 text-yellow-400" />;
      case 'removed': return <Trash2 className="w-5 h-5 text-green-400" />;
      case 'mitigated': return <Shield className="w-5 h-5 text-blue-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const quarantinedThreats = threats.filter(t => t.status === 'quarantined');
  const activeThreats = threats.filter(t => t.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Lock className="w-8 h-8 mr-3 text-yellow-400" />
          Quarantine System
        </h2>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-400">{activeThreats.length} Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">{quarantinedThreats.length} Quarantined</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {threats.map((threat) => (
          <motion.div
            key={threat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard hover={false}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(threat.status)}
                    <div>
                      <h3 className="text-white font-semibold">{threat.name}</h3>
                      <p className="text-gray-400 text-sm">{threat.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      threat.severity === 'critical' ? 'bg-red-400/20 text-red-400' :
                      threat.severity === 'high' ? 'bg-orange-400/20 text-orange-400' :
                      threat.severity === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-green-400/20 text-green-400'
                    }`}>
                      {threat.severity.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      threat.status === 'active' ? 'bg-red-400/20 text-red-400' :
                      threat.status === 'quarantined' ? 'bg-yellow-400/20 text-yellow-400' :
                      threat.status === 'removed' ? 'bg-green-400/20 text-green-400' :
                      'bg-blue-400/20 text-blue-400'
                    }`}>
                      {threat.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Detected: {threat.detected.toLocaleString()}
                    {threat.quarantineDate && (
                      <span className="ml-4">Quarantined: {threat.quarantineDate.toLocaleString()}</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {threat.status === 'active' && (
                      <>
                        <motion.button
                          onClick={() => { setSelectedThreat(threat); setShowMitigation(true); }}
                          disabled={isProcessing === threat.id}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4" />
                          <span>Mitigate</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleAction('quarantine', threat.id)}
                          disabled={isProcessing === threat.id}
                          className="flex items-center space-x-2 px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Lock className="w-4 h-4" />
                          <span>Quarantine</span>
                        </motion.button>
                      </>
                    )}
                    
                    {threat.status === 'quarantined' && (
                      <>
                        <motion.button
                          onClick={() => handleAction('restore', threat.id)}
                          disabled={isProcessing === threat.id}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Restore</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleAction('remove', threat.id)}
                          disabled={isProcessing === threat.id}
                          className="flex items-center space-x-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Mitigation Modal */}
      <AnimatePresence>
        {showMitigation && selectedThreat && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMitigation(false)}
          >
            <motion.div
              className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-2xl w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-blue-400" />
                  Mitigation Options
                </h3>
                <button
                  onClick={() => setShowMitigation(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="text-white font-medium mb-2">{selectedThreat.name}</div>
                <div className="text-gray-400 text-sm">{selectedThreat.path}</div>
              </div>
              
              <div className="space-y-3">
                {mitigationOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-white font-medium">{option.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            option.severity === 'high' ? 'bg-red-400/20 text-red-400' :
                            option.severity === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-green-400/20 text-green-400'
                          }`}>
                            {option.severity.toUpperCase()}
                          </span>
                          {option.automated && (
                            <span className="px-2 py-1 rounded text-xs bg-blue-400/20 text-blue-400">
                              AUTO
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{option.description}</p>
                      </div>
                      <motion.button
                        onClick={() => handleAction('mitigate', selectedThreat.id, option.id)}
                        disabled={isProcessing === selectedThreat.id}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Apply
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
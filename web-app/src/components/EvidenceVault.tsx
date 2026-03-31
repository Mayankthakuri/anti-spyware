import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileX, Shield, Trash2, Eye, Download } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ThreatData } from '../types';

interface EvidenceVaultProps {
  threats: ThreatData[];
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ threats }) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-400/20';
      case 'quarantined': return 'text-yellow-400 bg-yellow-400/20';
      case 'removed': return 'text-green-400 bg-green-400/20';
      case 'mitigated': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FileX className="w-8 h-8 mr-3 text-red-400" />
          Evidence Vault
        </h2>
        <div className="text-sm text-gray-400">
          {threats.length} threats detected
        </div>
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="space-y-3">
            {threats.slice(0, 5).map((threat) => (
              <motion.div
                key={threat.id}
                className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedThreat(threat)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <FileX className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">{threat.name}</div>
                      <div className="text-gray-400 text-xs truncate">{threat.path}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        threat.severity === 'critical' ? 'bg-red-400/20 text-red-400' :
                        threat.severity === 'high' ? 'bg-orange-400/20 text-orange-400' :
                        threat.severity === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-green-400/20 text-green-400'
                      }`}>
                        {threat.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        threat.status === 'active' ? 'bg-red-400/20 text-red-400' :
                        threat.status === 'quarantined' ? 'bg-yellow-400/20 text-yellow-400' :
                        threat.status === 'removed' ? 'bg-green-400/20 text-green-400' :
                        'bg-blue-400/20 text-blue-400'
                      }`}>
                        {threat.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {threat.type === 'trojan' ? 'Trojan Actor' :
                       threat.type === 'malware' ? 'Malware Actor' :
                       threat.type === 'spyware' ? 'Spyware Actor' :
                       threat.type === 'adware' ? 'Adware Actor' :
                       threat.type === 'ransomware' ? 'Ransomware Actor' :
                       'Unknown Actor'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {threats.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View All ({threats.length}) →
                </button>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <AnimatePresence>
        {selectedThreat && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedThreat(null)}
          >
            <motion.div
              className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Threat Analysis</h3>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">File Name</label>
                    <div className="text-white font-medium">{selectedThreat.name}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Threat Type</label>
                    <div className="text-white font-medium">{selectedThreat.type}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Full Path</label>
                  <div className="text-white font-mono text-sm bg-gray-800/50 p-2 rounded">{selectedThreat.path}</div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">SHA-256 Hash</label>
                  <div className="text-white font-mono text-sm bg-gray-800/50 p-2 rounded break-all">{selectedThreat.hash}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">File Size</label>
                    <div className="text-white font-medium">{(selectedThreat.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Detection Time</label>
                    <div className="text-white font-medium">{selectedThreat.detected.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Current Status</label>
                    <div className={`font-medium ${getStatusColor(selectedThreat.status)} px-2 py-1 rounded text-center`}>
                      {selectedThreat.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
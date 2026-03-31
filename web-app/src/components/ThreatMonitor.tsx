import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity, Zap } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ThreatData, SystemStatus } from '../types';

interface ThreatMonitorProps {
  systemStatus: SystemStatus;
  threats: ThreatData[];
  onStartScan: () => void;
}

export const ThreatMonitor: React.FC<ThreatMonitorProps> = ({ systemStatus, threats, onStartScan }) => {
  const activeThreatCount = threats.filter(t => t.status === 'active').length;
  const quarantinedCount = threats.filter(t => t.status === 'quarantined').length;
  const criticalThreatCount = threats.filter(t => t.severity === 'critical').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <GlassCard glow={systemStatus.systemHealth === 'excellent'}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Shield className={`w-8 h-8 ${
              systemStatus.systemHealth === 'excellent' ? 'text-green-400' : 
              systemStatus.systemHealth === 'good' ? 'text-blue-400' :
              systemStatus.systemHealth === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              systemStatus.systemHealth === 'excellent' ? 'bg-green-400/20 text-green-400' :
              systemStatus.systemHealth === 'good' ? 'bg-blue-400/20 text-blue-400' :
              systemStatus.systemHealth === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
              'bg-red-400/20 text-red-400'
            }`}>
              {systemStatus.systemHealth.toUpperCase()}
            </span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">System Health</h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  systemStatus.protectionLevel >= 90 ? 'bg-green-400' :
                  systemStatus.protectionLevel >= 70 ? 'bg-blue-400' :
                  systemStatus.protectionLevel >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${systemStatus.protectionLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-white font-bold">{systemStatus.protectionLevel}%</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard glow={activeThreatCount > 0}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className={`w-8 h-8 ${activeThreatCount > 0 ? 'text-red-400' : 'text-green-400'}`} />
            {activeThreatCount > 0 && (
              <motion.div
                className="w-3 h-3 bg-red-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Active Threats</h3>
          <div className="text-3xl font-bold text-white mb-1">{activeThreatCount}</div>
          <div className="text-sm text-gray-400">
            {criticalThreatCount} critical
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
            {systemStatus.isScanning && (
              <motion.div
                className="w-3 h-3 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
            )}
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Files Scanned</h3>
          <div className="text-3xl font-bold text-white mb-1">
            {systemStatus.filesScanned.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            Last scan: {systemStatus.lastScan.toLocaleTimeString()}
          </div>
          <div className="mt-4 text-sm">
            <div className="flex justify-between text-gray-400 mb-1">
              <span>Quarantined:</span>
              <span className="text-yellow-400 font-medium">{quarantinedCount}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <motion.button
              onClick={onStartScan}
              disabled={systemStatus.isScanning}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                systemStatus.isScanning 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
              }`}
              whileHover={!systemStatus.isScanning ? { scale: 1.05 } : {}}
              whileTap={!systemStatus.isScanning ? { scale: 0.95 } : {}}
            >
              {systemStatus.isScanning ? 'Scanning...' : 'Quick Scan'}
            </motion.button>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Protection Status</h3>
          <div className="text-lg font-bold text-green-400">ACTIVE</div>
          <div className="text-sm text-gray-400">Real-time monitoring</div>
        </div>
      </GlassCard>
    </div>
  );
};
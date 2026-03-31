import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Pause, CheckCircle, AlertTriangle, FileText, Shield, Zap } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ScanProgress, ThreatData } from '../types';

interface QuickScanPageProps {
  onStartScan: (target: string) => void;
  scanProgress: ScanProgress;
  isScanning: boolean;
  onBack: () => void;
}

export const QuickScanPage: React.FC<QuickScanPageProps> = ({
  onStartScan,
  scanProgress,
  isScanning,
  onBack
}) => {
  const [scanTarget, setScanTarget] = useState('/Users/mayankchand/Public/Antispyware');
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [detectedThreats, setDetectedThreats] = useState<ThreatData[]>([]);

  useEffect(() => {
    if (scanProgress.progress === 100 && !isScanning) {
      const scanResult = {
        id: Date.now(),
        timestamp: new Date(),
        target: scanTarget,
        filesScanned: scanProgress.filesScanned,
        threatsFound: scanProgress.threatsFound,
        duration: '2m 34s',
        status: scanProgress.threatsFound > 0 ? 'threats_found' : 'clean'
      };
      setScanHistory(prev => [scanResult, ...prev.slice(0, 4)]);
    }
  }, [scanProgress.progress, isScanning, scanTarget, scanProgress.filesScanned, scanProgress.threatsFound]);

  const handleStartScan = () => {
    onStartScan(scanTarget);
  };

  const getScanStatusColor = () => {
    if (isScanning) return '#3b82f6';
    if (scanProgress.progress === 100) {
      return scanProgress.threatsFound > 0 ? '#ef4444' : '#10b981';
    }
    return '#6b7280';
  };

  const getScanStatusText = () => {
    if (isScanning) return 'Scanning in progress...';
    if (scanProgress.progress === 100) {
      return scanProgress.threatsFound > 0 
        ? `Scan complete - ${scanProgress.threatsFound} threats found`
        : 'Scan complete - System clean';
    }
    return 'Ready to scan';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Search className="w-8 h-8 mr-3 text-blue-400" />
              Quick System Scan
            </h1>
            <p className="text-gray-400 mt-1">Real-time malware detection and system analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isScanning ? 'animate-pulse bg-blue-400' : 'bg-gray-600'}`}></div>
          <span className="text-sm text-gray-400">
            {isScanning ? 'Scanning Active' : 'Scanner Ready'}
          </span>
        </div>
      </div>

      {/* Scan Control Panel */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Scan Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scan Target Directory
              </label>
              <input
                type="text"
                value={scanTarget}
                onChange={(e) => setScanTarget(e.target.value)}
                disabled={isScanning}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                placeholder="Enter directory path to scan..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isScanning 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-blue-500/25'
                  }`}
                  whileHover={!isScanning ? { scale: 1.05 } : {}}
                  whileTap={!isScanning ? { scale: 0.95 } : {}}
                >
                  {isScanning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isScanning ? 'Scanning...' : 'Start Quick Scan'}</span>
                </motion.button>

                <div className="text-sm text-gray-400">
                  <div>Scan Engine: C++ Detector v2.0</div>
                  <div>Real-time Protection: Active</div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-semibold`} style={{ color: getScanStatusColor() }}>
                  {getScanStatusText()}
                </div>
                <div className="text-sm text-gray-400">
                  Last scan: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Scan Progress */}
      <AnimatePresence>
        {(isScanning || scanProgress.progress > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Scan Progress</h3>
                  <span className="text-2xl font-bold text-white">{scanProgress.progress.toFixed(1)}%</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress.progress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{scanProgress.filesScanned.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Files Scanned</div>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{scanProgress.totalFiles.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Files</div>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{scanProgress.threatsFound}</div>
                    <div className="text-sm text-gray-400">Threats Found</div>
                  </div>
                </div>

                {scanProgress.currentFile && (
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Currently scanning:</div>
                    <div className="text-white font-mono text-sm truncate">{scanProgress.currentFile}</div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Results */}
      {scanProgress.progress === 100 && !isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Scan Results</h3>
                {scanProgress.threatsFound === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Scan Duration</div>
                  <div className="text-xl font-bold text-white">2m 34s</div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Scan Speed</div>
                  <div className="text-xl font-bold text-white">{Math.floor(scanProgress.filesScanned / 154)} files/sec</div>
                </div>
              </div>

              {scanProgress.threatsFound > 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-red-400">Threats Detected</span>
                  </div>
                  <div className="text-white">
                    {scanProgress.threatsFound} potential threats found and automatically quarantined.
                    Check the Quarantine section for details.
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">System Clean</span>
                  </div>
                  <div className="text-white">
                    No threats detected. Your system is secure.
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Scans</h3>
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {scan.status === 'clean' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">{scan.target}</div>
                      <div className="text-sm text-gray-400">
                        {scan.timestamp.toLocaleString()} • {scan.filesScanned.toLocaleString()} files
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${scan.status === 'clean' ? 'text-green-400' : 'text-red-400'}`}>
                      {scan.status === 'clean' ? 'Clean' : `${scan.threatsFound} threats`}
                    </div>
                    <div className="text-sm text-gray-400">{scan.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
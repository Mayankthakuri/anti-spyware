import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ScanProgress as ScanProgressType } from '../types';

interface ScanProgressProps {
  scanProgress: ScanProgressType;
  onStartScan: () => void;
  onStartFullScan?: () => void;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ scanProgress, onStartScan, onStartFullScan }) => {
  const isScanning = scanProgress.progress > 0 && scanProgress.progress < 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Search className="w-8 h-8 mr-3 text-blue-400" />
          System Scanner
        </h2>
        <div className="flex gap-4">
          <motion.button
            onClick={onStartScan}
            disabled={isScanning}
            className={`px-6 py-3 text-white rounded-lg font-medium transition-all shadow-lg ${
              isScanning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/25'
            }`}
            whileHover={!isScanning ? { scale: 1.05 } : {}}
            whileTap={!isScanning ? { scale: 0.95 } : {}}
          >
            {isScanning ? 'Scanning...' : 'Deep Scan'}
          </motion.button>
          {onStartFullScan && (
            <motion.button
              onClick={onStartFullScan}
              disabled={isScanning}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all shadow-lg ${
                isScanning 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-500/25'
              }`}
              whileHover={!isScanning ? { scale: 1.05 } : {}}
              whileTap={!isScanning ? { scale: 0.95 } : {}}
            >
              {isScanning ? 'Scanning...' : 'Full System Scan'}
            </motion.button>
          )}
        </div>
      </div>

      <GlassCard>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Scan Progress</span>
              <span className="text-white font-bold">{scanProgress.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress.progress}%` }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-white/20 animate-scan"></div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <Search className="w-8 h-8 text-red-400 mx-auto mb-2" />
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
    </div>
  );
};
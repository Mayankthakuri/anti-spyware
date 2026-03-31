import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, FileX, Terminal, Search, Settings, Lock } from 'lucide-react';
import { ThreatMonitor } from './components/ThreatMonitor';
import { EvidenceVault } from './components/EvidenceVault';
import { ForensicLogs } from './components/ForensicLogs';
import { ScanProgress } from './components/ScanProgress';
import { QuarantineSystem } from './components/QuarantineSystem';
import { SettingsModal } from './components/SettingsModal';
import { useRealTimeData } from './hooks/useRealTimeData';

type TabType = 'dashboard' | 'evidence' | 'logs' | 'scanner' | 'quarantine';

function App() {
  const [activeTab, setActiveTab] = React.useState<TabType>('dashboard');
  const [showSettings, setShowSettings] = React.useState(false);
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);
  
  const {
    threats,
    systemStatus,
    logs,
    scanProgress,
    quarantineThreat,
    restoreThreat,
    removeThreat,
    mitigateThreat,
    startScan,
    startFullScan,
    isConnected
  } = useRealTimeData();

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'evidence', label: 'Evidence Vault', icon: FileX },
    { id: 'quarantine', label: 'Quarantine', icon: Lock },
    { id: 'logs', label: 'Forensic Logs', icon: Terminal },
    { id: 'scanner', label: 'System Scanner', icon: Search },
  ];

  const handleQuarantine = async (threatId: string) => {
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      return await quarantineThreat(threatId, threat.path);
    }
    return false;
  };

  const handleRemove = async (threatId: string) => {
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      return await removeThreat(threat.hash);
    }
    return false;
  };

  const handleRestore = async (threatId: string) => {
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      return await restoreThreat(threat.hash);
    }
    return false;
  };

  const handleMitigate = async (threatId: string, mitigationType: string) => {
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      return await mitigateThreat(threat.path, mitigationType);
    }
    return false;
  };

  const handleQuickScanClick = () => {
    setActiveTab('scanner');
    startScan();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-purple-500/10"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AntiSpyware Pro</h1>
                <p className="text-sm text-gray-400">Enterprise Security Command Center</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs font-medium">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
              </div>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <div>
              <ThreatMonitor systemStatus={systemStatus} threats={threats} onStartScan={handleQuickScanClick} />
              <div className="grid grid-cols-1 gap-8">
                <div className="grid grid-cols-5 gap-6 flex flex-col">
                  <div className="col-span-5 mb-4">
                    <EvidenceVault threats={threats} />
                  </div>
                  <div className="col-span-5">
                    <ForensicLogs logs={logs} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'evidence' && <EvidenceVault threats={threats} />}
          {activeTab === 'quarantine' && (
            <QuarantineSystem 
              threats={threats}
              onQuarantine={handleQuarantine}
              onRemove={handleRemove}
              onRestore={handleRestore}
              onMitigate={handleMitigate}
            />
          )}
          {activeTab === 'logs' && <ForensicLogs logs={logs} />}
          {activeTab === 'scanner' && <ScanProgress scanProgress={scanProgress} onStartScan={startScan} onStartFullScan={startFullScan} />}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-md bg-black/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>© 2024 AntiSpyware Pro. Enterprise Security Solution.</div>
            <div className="flex items-center space-x-4">
              <span>Last Update: {new Date().toLocaleTimeString()}</span>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

export default App;
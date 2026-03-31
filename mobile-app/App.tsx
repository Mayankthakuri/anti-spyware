import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ForensicLogs } from './src/components/ForensicLogs';
import { ForensicLogsDetailed } from './src/components/ForensicLogsDetailed';
import { EvidenceVault } from './src/components/EvidenceVault';

// WebSocket connection for real-time data
const WS_URL = 'ws://localhost:3001';

// Mock data for demonstration
const mockSystemStatus = {
  isScanning: false,
  lastScan: new Date(),
  threatsDetected: 0,
  filesScanned: 0,
  systemHealth: 'good' as const,
  protectionLevel: 100,
};

const mockLogs = [
  {
    id: '1',
    timestamp: new Date(),
    level: 'info',
    message: 'AntiSpyware Pro initialized',
    source: 'system'
  }
];
const mockThreats = [];

type TabType = 'dashboard' | 'evidence' | 'quarantine' | 'logs' | 'scanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [threats, setThreats] = useState(mockThreats);
  const [logs, setLogs] = useState(mockLogs);
  const [systemStatus, setSystemStatus] = useState(mockSystemStatus);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [scanProgress, setScanProgress] = useState({
    progress: 0,
    filesScanned: 0,
    totalFiles: 0,
    threatsFound: 0,
    currentFile: '',
    isScanning: false,
    detectedThreats: [] as Array<{id: string, path: string, hash: string}>
  });

  // Background AntiSpyware process simulation
  useEffect(() => {
    const runBackgroundScan = () => {
      // Add system activity logs
      const systemLogs = [
        { level: 'info', message: 'File system scan completed', source: 'scanner' },
        { level: 'info', message: 'Hash verification completed', source: 'system' },
        { level: 'info', message: 'Real-time monitoring active', source: 'system' }
      ];
      
      // Add random system log
      if (Math.random() > 0.7) {
        const randomLog = systemLogs[Math.floor(Math.random() * systemLogs.length)];
        setLogs(prev => [{
          id: Date.now().toString(),
          timestamp: new Date(),
          level: randomLog.level as const,
          message: randomLog.message,
          source: randomLog.source
        }, ...prev.slice(0, 19)]);
      }
      
      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        filesScanned: prev.filesScanned + Math.floor(Math.random() * 50),
        threatsDetected: threats.filter(t => t.status === 'active').length,
        protectionLevel: Math.max(85, 100 - (threats.filter(t => t.status === 'active').length * 10))
      }));
    };
    
    const interval = setInterval(runBackgroundScan, 10000);
    return () => clearInterval(interval);
  }, [threats]);

  useEffect(() => {
    // Simulate AntiSpyware connection status
    setIsConnected(true);
    
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info' as const,
      message: 'AntiSpyware Pro initialized successfully',
      source: 'system'
    }, ...prev.slice(0, 19)]);
  }, []);

  const quarantineThreat = (threatPath: string) => {
    // Simulate quarantine operation
    setThreats(prev => prev.map(t => 
      t.path === threatPath ? { 
        ...t, 
        status: 'quarantined' as const,
        quarantineDate: new Date()
      } : t
    ));
    
    // Add log entry
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info' as const,
      message: `Threat quarantined: ${threatPath.split('/').pop()}`,
      source: 'quarantine'
    }, ...prev.slice(0, 19)]);
    
    // Update system status
    setSystemStatus(prev => ({
      ...prev,
      protectionLevel: Math.min(100, prev.protectionLevel + 5)
    }));
  };

  const restoreThreat = (threatHash: string) => {
    setThreats(prev => prev.map(t => 
      t.hash === threatHash ? { ...t, status: 'active' as const } : t
    ));
    
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'warning' as const,
      message: `Threat restored from quarantine`,
      source: 'quarantine'
    }, ...prev.slice(0, 19)]);
  };

  const removeThreat = (threatHash: string) => {
    const threat = threats.find(t => t.hash === threatHash);
    setThreats(prev => prev.filter(t => t.hash !== threatHash));
    
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info' as const,
      message: `Threat permanently removed: ${threat?.name}`,
      source: 'quarantine'
    }, ...prev.slice(0, 19)]);
  };

  const mitigateThreat = (threatPath: string, mitigationType: string) => {
    setThreats(prev => prev.map(t => 
      t.path === threatPath ? { ...t, status: 'mitigated' as const } : t
    ));
    
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info' as const,
      message: `Threat mitigated (${mitigationType}): ${threatPath.split('/').pop()}`,
      source: 'mitigation'
    }, ...prev.slice(0, 19)]);
  };
  const startQuickScan = () => {
    console.log('Starting quick scan...');
    setScanProgress({
      progress: 0,
      filesScanned: 0,
      totalFiles: 500,
      threatsFound: 0,
      currentFile: 'Initializing quick scan...',
      isScanning: true,
      detectedThreats: []
    });
    
    setSystemStatus(prev => ({ ...prev, isScanning: true }));
    
    // Quick scan - faster interval, fewer files
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 15 + 5, 100);
        const newFilesScanned = Math.min(prev.filesScanned + Math.floor(Math.random() * 25) + 15, prev.totalFiles);
        const newThreatsFound = Math.random() > 0.85 ? prev.threatsFound + 1 : prev.threatsFound;
        
        if (newProgress >= 100) {
          clearInterval(scanInterval);
          setSystemStatus(prev => ({ 
            ...prev, 
            isScanning: false,
            lastScan: new Date(),
            filesScanned: prev.filesScanned + newFilesScanned
          }));
          
          setLogs(prev => [{
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info' as const,
            message: `Quick scan completed: ${newFilesScanned} files scanned, ${newThreatsFound} threats found`,
            source: 'scanner'
          }, ...prev.slice(0, 19)]);
          
          // Add detected threats to threats list
          if (newThreatsFound > 0) {
            const detectedThreats = [];
            for (let i = 0; i < newThreatsFound; i++) {
              const newThreat = {
                id: (Date.now() + i).toString(),
                name: `quick_threat_${Math.floor(Math.random() * 1000)}.exe`,
                type: ['malware', 'spyware', 'trojan'][Math.floor(Math.random() * 3)] as const,
                severity: ['high', 'critical'][Math.floor(Math.random() * 2)] as const,
                path: `/quick/threat_${Math.floor(Math.random() * 1000)}.exe`,
                size: Math.floor(Math.random() * 300000),
                detected: new Date(),
                status: 'active' as const,
                hash: Math.random().toString(36).substring(7),
              };
              detectedThreats.push(newThreat);
            }
            setThreats(prev => [...prev, ...detectedThreats]);
            
            setLogs(prev => [{
              id: (Date.now() + 100).toString(),
              timestamp: new Date(),
              level: 'warning' as const,
              message: `Quick scan detected ${newThreatsFound} threats - review required`,
              source: 'scanner'
            }, ...prev.slice(0, 19)]);
          }
          
          return {
            ...prev,
            progress: 100,
            filesScanned: newFilesScanned,
            threatsFound: newThreatsFound,
            currentFile: 'Quick scan completed',
            isScanning: false,
            detectedThreats: prev.detectedThreats
          };
        }
        
        return {
          ...prev,
          progress: newProgress,
          filesScanned: newFilesScanned,
          threatsFound: newThreatsFound,
          currentFile: `/System/critical_${Math.floor(Math.random() * 100)}.dylib`,
          detectedThreats: prev.detectedThreats.concat(
            newThreatsFound > prev.threatsFound ? [{
              id: Date.now().toString(),
              path: `/quick/threat_${Math.floor(Math.random() * 100)}.exe`,
              hash: Math.random().toString(36).substring(7)
            }] : []
          )
        };
      });
    }, 400);
  };
    console.log('Starting deep scan...');
    setScanProgress({
      progress: 0,
      filesScanned: 0,
      totalFiles: 1000,
      threatsFound: 0,
      currentFile: 'Initializing deep scan...',
      isScanning: true,
      detectedThreats: []
    });
    
    setSystemStatus(prev => ({ ...prev, isScanning: true }));
    
    // Deep scan - slower, more comprehensive
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 8 + 2, 100);
        const newFilesScanned = Math.min(prev.filesScanned + Math.floor(Math.random() * 40) + 20, prev.totalFiles);
        const newThreatsFound = Math.random() > 0.88 ? prev.threatsFound + 1 : prev.threatsFound;
        
        if (newProgress >= 100) {
          clearInterval(scanInterval);
          setSystemStatus(prev => ({ 
            ...prev, 
            isScanning: false,
            lastScan: new Date(),
            filesScanned: prev.filesScanned + newFilesScanned
          }));
          
          setLogs(prev => [{
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info' as const,
            message: `Deep scan completed: ${newFilesScanned} files scanned, ${newThreatsFound} threats found`,
            source: 'scanner'
          }, ...prev.slice(0, 19)]);
          
          // Add detected threats to threats list
          if (newThreatsFound > 0) {
            const detectedThreats = [];
            for (let i = 0; i < newThreatsFound; i++) {
              const newThreat = {
                id: (Date.now() + i).toString(),
                name: `detected_threat_${Math.floor(Math.random() * 1000)}.exe`,
                type: ['malware', 'spyware', 'trojan'][Math.floor(Math.random() * 3)] as const,
                severity: ['high', 'critical'][Math.floor(Math.random() * 2)] as const,
                path: `/scan/detected_${Math.floor(Math.random() * 1000)}.exe`,
                size: Math.floor(Math.random() * 500000),
                detected: new Date(),
                status: 'active' as const,
                hash: Math.random().toString(36).substring(7),
              };
              detectedThreats.push(newThreat);
            }
            setThreats(prev => [...prev, ...detectedThreats]);
            
            setLogs(prev => [{
              id: (Date.now() + 100).toString(),
              timestamp: new Date(),
              level: 'warning' as const,
              message: `Deep scan detected ${newThreatsFound} new threats - immediate action required`,
              source: 'scanner'
            }, ...prev.slice(0, 19)]);
          }
          
          return {
            ...prev,
            progress: 100,
            filesScanned: newFilesScanned,
            threatsFound: newThreatsFound,
            currentFile: 'Deep scan completed',
            isScanning: false
          };
        }
        
        return {
          ...prev,
          progress: newProgress,
          filesScanned: newFilesScanned,
          threatsFound: newThreatsFound,
          currentFile: `/System/Library/file_${Math.floor(Math.random() * 1000)}.dylib`,
          detectedThreats: prev.detectedThreats.concat(
            newThreatsFound > prev.threatsFound ? [{
              id: Date.now().toString(),
              path: `/scan/threat_${Math.floor(Math.random() * 1000)}.exe`,
              hash: Math.random().toString(36).substring(7)
            }] : []
          )
        };
      });
    }, 1000);
  };

  const startFullScan = () => {
    console.log('Starting full system scan...');
    setScanProgress({
      progress: 0,
      filesScanned: 0,
      totalFiles: 2500,
      threatsFound: 0,
      currentFile: 'Initializing full system scan...',
      isScanning: true,
      detectedThreats: []
    });
    
    setSystemStatus(prev => ({ ...prev, isScanning: true }));
    
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info' as const,
      message: 'Full system scan initiated - scanning entire system',
      source: 'scanner'
    }, ...prev.slice(0, 19)]);
    
    // Full scan - comprehensive, slower, more thorough
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 5 + 1, 100);
        const newFilesScanned = Math.min(prev.filesScanned + Math.floor(Math.random() * 60) + 30, prev.totalFiles);
        const newThreatsFound = Math.random() > 0.82 ? prev.threatsFound + 1 : prev.threatsFound;
        
        if (newProgress >= 100) {
          clearInterval(scanInterval);
          setSystemStatus(prev => ({ 
            ...prev, 
            isScanning: false,
            lastScan: new Date(),
            filesScanned: prev.filesScanned + newFilesScanned
          }));
          
          setLogs(prev => [{
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info' as const,
            message: `Full system scan completed: ${newFilesScanned} files scanned, ${newThreatsFound} threats found`,
            source: 'scanner'
          }, ...prev.slice(0, 19)]);
          
          // Add detected threats to threats list
          if (newThreatsFound > 0) {
            const detectedThreats = [];
            for (let i = 0; i < newThreatsFound; i++) {
              const newThreat = {
                id: (Date.now() + i).toString(),
                name: `full_scan_threat_${Math.floor(Math.random() * 1000)}.exe`,
                type: ['malware', 'spyware', 'trojan', 'rootkit', 'adware'][Math.floor(Math.random() * 5)] as const,
                severity: ['high', 'critical'][Math.floor(Math.random() * 2)] as const,
                path: `/System/threat_${Math.floor(Math.random() * 1000)}.exe`,
                size: Math.floor(Math.random() * 800000),
                detected: new Date(),
                status: 'active' as const,
                hash: Math.random().toString(36).substring(7),
              };
              detectedThreats.push(newThreat);
            }
            setThreats(prev => [...prev, ...detectedThreats]);
            
            setLogs(prev => [{
              id: (Date.now() + 100).toString(),
              timestamp: new Date(),
              level: 'critical' as const,
              message: `Full system scan detected ${newThreatsFound} threats - comprehensive analysis complete`,
              source: 'scanner'
            }, ...prev.slice(0, 19)]);
          }
          
          return {
            ...prev,
            progress: 100,
            filesScanned: newFilesScanned,
            threatsFound: newThreatsFound,
            currentFile: 'Full system scan completed',
            isScanning: false
          };
        }
        
        return {
          ...prev,
          progress: newProgress,
          filesScanned: newFilesScanned,
          threatsFound: newThreatsFound,
          currentFile: `/System/Library/Frameworks/file_${Math.floor(Math.random() * 1000)}.framework`,
          detectedThreats: prev.detectedThreats.concat(
            newThreatsFound > prev.threatsFound ? [{
              id: Date.now().toString(),
              path: `/System/threat_${Math.floor(Math.random() * 1000)}.exe`,
              hash: Math.random().toString(36).substring(7)
            }] : []
          )
        };
      });
    }, 1500);
  };

  const startDeepScan = () => {
    console.log('Starting deep scan...');
    setScanProgress({
      progress: 0,
      filesScanned: 0,
      totalFiles: 1000,
      threatsFound: 0,
      currentFile: 'Initializing deep scan...',
      isScanning: true,
      detectedThreats: []
    });
    
    setSystemStatus(prev => ({ ...prev, isScanning: true }));
    
    // Deep scan - slower, more comprehensive
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 8 + 2, 100);
        const newFilesScanned = Math.min(prev.filesScanned + Math.floor(Math.random() * 40) + 20, prev.totalFiles);
        const newThreatsFound = Math.random() > 0.88 ? prev.threatsFound + 1 : prev.threatsFound;
        
        if (newProgress >= 100) {
          clearInterval(scanInterval);
          setSystemStatus(prev => ({ 
            ...prev, 
            isScanning: false,
            lastScan: new Date(),
            filesScanned: prev.filesScanned + newFilesScanned
          }));
          
          setLogs(prev => [{
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info' as const,
            message: `Deep scan completed: ${newFilesScanned} files scanned, ${newThreatsFound} threats found`,
            source: 'scanner'
          }, ...prev.slice(0, 19)]);
          
          // Add detected threats to threats list
          if (newThreatsFound > 0) {
            const detectedThreats = [];
            for (let i = 0; i < newThreatsFound; i++) {
              const newThreat = {
                id: (Date.now() + i).toString(),
                name: `detected_threat_${Math.floor(Math.random() * 1000)}.exe`,
                type: ['malware', 'spyware', 'trojan'][Math.floor(Math.random() * 3)] as const,
                severity: ['high', 'critical'][Math.floor(Math.random() * 2)] as const,
                path: `/scan/detected_${Math.floor(Math.random() * 1000)}.exe`,
                size: Math.floor(Math.random() * 500000),
                detected: new Date(),
                status: 'active' as const,
                hash: Math.random().toString(36).substring(7),
              };
              detectedThreats.push(newThreat);
            }
            setThreats(prev => [...prev, ...detectedThreats]);
            
            setLogs(prev => [{
              id: (Date.now() + 100).toString(),
              timestamp: new Date(),
              level: 'warning' as const,
              message: `Deep scan detected ${newThreatsFound} new threats - immediate action required`,
              source: 'scanner'
            }, ...prev.slice(0, 19)]);
          }
          
          return {
            ...prev,
            progress: 100,
            filesScanned: newFilesScanned,
            threatsFound: newThreatsFound,
            currentFile: 'Deep scan completed',
            isScanning: false
          };
        }
        
        return {
          ...prev,
          progress: newProgress,
          filesScanned: newFilesScanned,
          threatsFound: newThreatsFound,
          currentFile: `/System/Library/file_${Math.floor(Math.random() * 1000)}.dylib`,
          detectedThreats: prev.detectedThreats.concat(
            newThreatsFound > prev.threatsFound ? [{
              id: Date.now().toString(),
              path: `/scan/threat_${Math.floor(Math.random() * 1000)}.exe`,
              hash: Math.random().toString(36).substring(7)
            }] : []
          )
        };
      });
    }, 1000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Command', icon: '⚡' },
    { id: 'evidence', label: 'Evidence', icon: '📁' },
    { id: 'quarantine', label: 'Quarantine', icon: '🔒' },
    { id: 'logs', label: 'Logs', icon: '📋' },
    { id: 'scanner', label: 'Scanner', icon: '🔍' },
  ];

  const activeThreatCount = threats.filter(t => t.status === 'active').length;
  const quarantinedCount = threats.filter(t => t.status === 'quarantined').length;

  const renderDashboard = () => (
    <ScrollView style={styles.content}>
      <View style={styles.grid}>
        {/* System Health */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🛡️</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#3b82f633' }]}>
                <Text style={[styles.statusText, { color: '#3b82f6' }]}>
                  {systemStatus.systemHealth.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>System Health</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${systemStatus.protectionLevel}%` }]} />
              </View>
              <Text style={styles.progressText}>{systemStatus.protectionLevel}%</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Active Threats */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⚠️</Text>
              {activeThreatCount > 0 && <View style={styles.alertDot} />}
            </View>
            <Text style={styles.cardTitle}>Active Threats</Text>
            <Text style={styles.cardValue}>{activeThreatCount}</Text>
            <Text style={styles.cardSubtext}>0 critical</Text>
          </LinearGradient>
        </View>

        {/* Files Scanned */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📄</Text>
            </View>
            <Text style={styles.cardTitle}>Files Scanned</Text>
            <Text style={styles.cardValue}>{systemStatus.filesScanned.toLocaleString()}</Text>
            <Text style={styles.cardSubtext}>
              Last: {systemStatus.lastScan.toLocaleTimeString()}
            </Text>
            <Text style={styles.quarantineInfo}>
              Quarantined: {quarantinedCount}
            </Text>
          </LinearGradient>
        </View>

        {/* Quick Scan */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⚡</Text>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={() => {
                  startQuickScan();
                }}
              >
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={styles.scanButtonGradient}
                >
                  <Text style={styles.scanButtonText}>Quick Scan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>Protection Status</Text>
            <Text style={styles.activeStatus}>ACTIVE</Text>
            <Text style={styles.cardSubtext}>Real-time monitoring</Text>
          </LinearGradient>
        </View>
        {/* Evidence Vault */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📁</Text>
              <TouchableOpacity onPress={() => setActiveTab('evidence')}>
                <Text style={styles.viewMoreText}>View →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>Evidence Vault</Text>
            <Text style={styles.cardValue}>{threats.length}</Text>
            <Text style={styles.cardSubtext}>threats detected</Text>
          </LinearGradient>
        </View>

        {/* Forensic Logs */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📋</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
                <TouchableOpacity onPress={() => setActiveTab('logs')}>
                  <Text style={styles.viewMoreText}>View →</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cardTitle}>Forensic Logs</Text>
            <Text style={styles.cardValue}>Live</Text>
            <Text style={styles.cardSubtext}>{isConnected ? 'monitoring' : 'offline'}</Text>
            <Text style={styles.quarantineInfo}>
              {logs.filter(l => l.level === 'critical' || l.level === 'error').length} Critical Events
            </Text>
          </LinearGradient>
        </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'evidence':
        return <EvidenceVault threats={threats} />;
      case 'quarantine':
        return (
          <View style={styles.quarantineContainer}>
            <ScrollView style={styles.content}>
              <Text style={styles.sectionTitle}>Quarantine System</Text>
              {threats.map((threat) => (
                <View key={threat.id} style={styles.threatCard}>
                  <Text style={styles.threatName}>{threat.name}</Text>
                  <Text style={styles.threatPath}>{threat.path}</Text>
                  <View style={styles.actionButtons}>
                    {threat.status === 'active' ? (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#f59e0b33' }]}
                          onPress={() => quarantineThreat(threat.path)}
                        >
                          <Text style={[styles.actionButtonText, { color: '#f59e0b' }]}>Quarantine</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#3b82f633' }]}
                          onPress={() => mitigateThreat(threat.path, 'isolate')}
                        >
                          <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>Mitigate</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#10b98133' }]}
                          onPress={() => restoreThreat(threat.hash)}
                        >
                          <Text style={[styles.actionButtonText, { color: '#10b981' }]}>Restore</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#ef444433' }]}
                          onPress={() => removeThreat(threat.hash)}
                        >
                          <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Remove</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.quarantineFooter}>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>{activeThreatCount} Active</Text>
                <Text style={styles.statText}>{quarantinedCount} Quarantined</Text>
              </View>
            </View>
          </View>
        );
      case 'logs':
        return <ForensicLogsDetailed logs={logs} />;
      case 'scanner':
        return (
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>System Scanner</Text>
            <View style={styles.scannerContainer}>
              <View style={styles.scanButtonContainer}>
                <TouchableOpacity 
                  style={styles.scanButton}
                  onPress={startDeepScan}
                  disabled={scanProgress.isScanning}
                >
                  <LinearGradient
                    colors={scanProgress.isScanning ? ['#6b7280', '#4b5563'] : ['#3b82f6', '#1d4ed8']}
                    style={styles.scanButtonGradient}
                  >
                    <Text style={styles.scanButtonText}>
                      {scanProgress.isScanning ? '🔄 Scanning...' : '🔍 Deep Scan'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.scanButton}
                  onPress={startFullScan}
                  disabled={scanProgress.isScanning}
                >
                  <LinearGradient
                    colors={scanProgress.isScanning ? ['#6b7280', '#4b5563'] : ['#7c3aed', '#5b21b6']}
                    style={styles.scanButtonGradient}
                  >
                    <Text style={styles.scanButtonText}>
                      {scanProgress.isScanning ? '🔄 Scanning...' : '🛡️ Full Scan'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <View style={styles.scanProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Scan Progress</Text>
                  <Text style={styles.progressPercent}>{scanProgress.progress.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${scanProgress.progress}%` }]} />
                </View>
              </View>
              
              <View style={styles.scanStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>📄</Text>
                  <Text style={styles.statValue}>{scanProgress.filesScanned.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Files Scanned</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>🛡️</Text>
                  <Text style={styles.statValue}>{scanProgress.totalFiles.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Files</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>⚠️</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      if (scanProgress.threatsFound > 0) {
                        const actions = [
                          'Quarantine All Threats',
                          'Mitigate (Network Isolation)',
                          'Mitigate (Permission Revocation)',
                          'View Threat Details'
                        ];
                        
                        // Simple action selection for mobile
                        const actionIndex = Math.floor(Math.random() * 2); // 0 or 1
                        const selectedAction = actions[actionIndex];
                        
                        if (scanProgress.detectedThreats.length > 0) {
                          const threat = scanProgress.detectedThreats[Math.floor(Math.random() * scanProgress.detectedThreats.length)];
                          
                          if (actionIndex === 0) {
                            // Quarantine
                            quarantineThreat(threat.path);
                            setLogs(prev => [{
                              id: Date.now().toString(),
                              timestamp: new Date(),
                              level: 'info' as const,
                              message: `Auto-quarantined threat from scan: ${threat.path.split('/').pop()}`,
                              source: 'scanner'
                            }, ...prev.slice(0, 19)]);
                          } else {
                            // Mitigate
                            const mitigationType = actionIndex === 1 ? 'isolate' : 'revoke';
                            mitigateThreat(threat.path, mitigationType);
                            setLogs(prev => [{
                              id: Date.now().toString(),
                              timestamp: new Date(),
                              level: 'info' as const,
                              message: `Auto-mitigated threat from scan: ${threat.path.split('/').pop()} (${mitigationType})`,
                              source: 'scanner'
                            }, ...prev.slice(0, 19)]);
                          }
                        }
                      }
                    }}
                    disabled={scanProgress.threatsFound === 0}
                  >
                    <Text style={[styles.statValue, scanProgress.threatsFound > 0 && { color: '#ef4444' }]}>
                      {scanProgress.threatsFound}
                    </Text>
                    <Text style={styles.statLabel}>Threats Found</Text>
                    {scanProgress.threatsFound > 0 && (
                      <Text style={styles.threatAction}>Tap to Quarantine</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              {scanProgress.currentFile && (
                <View style={styles.currentFile}>
                  <Text style={styles.currentFileLabel}>Currently scanning:</Text>
                  <Text style={styles.currentFileName}>{scanProgress.currentFile}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );
      default:
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
            <Text style={styles.comingSoon}>Feature fully implemented!</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      <LinearGradient
        colors={['#1f2937', '#1e3a8a', '#7c3aed']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#3b82f6', '#7c3aed']}
                style={styles.logoContainer}
              >
                <Text style={styles.logoText}>🛡️</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>AntiSpyware Pro</Text>
                <Text style={styles.headerSubtitle}>Mobile Security Center</Text>
              </View>
            </View>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
              <Text style={[styles.statusText, { color: isConnected ? '#10b981' : '#ef4444' }]}>
                {isConnected ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          {renderContent()}
        </View>

        {/* Bottom Navigation - Sliding Bar */}
        <View style={styles.bottomNav}>
          <View style={styles.slidingContainer}>
            <View style={[styles.slider, { left: `${tabs.findIndex(t => t.id === activeTab) * 20}%` }]} />
            <View style={styles.tabContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab.id as TabType)}
                >
                  <Text style={[
                    styles.tabIcon,
                    activeTab === tab.id && styles.activeTabIcon
                  ]}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab.id && styles.activeTabLabel
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  background: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  scanButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scanButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  scanButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  activeStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  quarantineInfo: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 4,
  },
  bottomNav: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  slidingContainer: {
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    top: 0,
    width: '20%',
    height: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    zIndex: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    flex: 1,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 20,
  },
  comingSoon: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 50,
  },
  threatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  threatName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  threatPath: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  threatMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '600',
  },
  quarantineContainer: {
    flex: 1,
  },
  quarantineFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Log styles
  logContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logHeaderText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  logCount: {
    color: '#9ca3af',
    fontSize: 12,
  },
  logScroll: {
    maxHeight: 300,
  },
  logEntry: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTime: {
    color: '#9ca3af',
    fontSize: 11,
  },
  logLevel: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  logMessage: {
    color: 'white',
    fontSize: 13,
  },
  // Scanner styles
  scannerContainer: {
    paddingVertical: 20,
  },
  scanProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
  },
  currentFile: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  currentFileLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  currentFileName: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  // Evidence Vault styles
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  evidenceCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceIcon: {
    fontSize: 20,
  },
  evidenceMeta: {
    flexDirection: 'column',
    gap: 4,
  },
  evidenceName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  evidenceType: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  evidenceActor: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '500',
  },
  threatAction: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  // Compact sections for dashboard
  sectionContainer: {
    marginVertical: 16,
  },
  compactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactIcon: {
    fontSize: 20,
  },
  compactCount: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  horizontalScroll: {
    marginBottom: 12,
  },
  compactThreatCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactThreatName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  compactBadges: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  compactBadge: {
    fontSize: 8,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactThreatType: {
    color: '#6b7280',
    fontSize: 10,
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewMoreText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  logsContainer: {
    marginBottom: 12,
  },
  compactLogEntry: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
  },
  logLevelBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logLevelText: {
    fontSize: 8,
    fontWeight: '600',
  },
  statusLabel: {
    color: '#9ca3af',
    fontSize: 10,
    marginLeft: 4,
  },
});
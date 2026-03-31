import { useState, useEffect, useCallback } from 'react';
import { ThreatData, SystemStatus, ForensicLog, ScanProgress } from '../types';

export const useSystemStatus = () => {
  const [status, setStatus] = useState<SystemStatus>({
    isScanning: false,
    lastScan: new Date(Date.now() - 3600000),
    threatsDetected: 3,
    filesScanned: 45672,
    systemHealth: 'good',
    protectionLevel: 94,
  });

  const startScan = useCallback(() => {
    setStatus(prev => ({ ...prev, isScanning: true }));
    setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        isScanning: false,
        lastScan: new Date(),
        filesScanned: prev.filesScanned + Math.floor(Math.random() * 1000),
      }));
    }, 5000);
  }, []);

  return { status, startScan };
};

export const useThreatData = () => {
  const [threats, setThreats] = useState<ThreatData[]>([
    {
      id: '1',
      name: 'Suspicious.exe',
      type: 'malware',
      severity: 'high',
      path: '/Users/user/Downloads/suspicious.exe',
      size: 2048576,
      detected: new Date(Date.now() - 1800000),
      status: 'quarantined',
      hash: 'a1b2c3d4e5f6...',
      quarantineDate: new Date(Date.now() - 1200000),
    },
    {
      id: '2',
      name: 'Keylogger.dll',
      type: 'spyware',
      severity: 'critical',
      path: '/System/Library/keylogger.dll',
      size: 512000,
      detected: new Date(Date.now() - 3600000),
      status: 'active',
      hash: 'f6e5d4c3b2a1...',
    },
    {
      id: '3',
      name: 'AdTracker.js',
      type: 'adware',
      severity: 'medium',
      path: '/Applications/Browser/adtracker.js',
      size: 128000,
      detected: new Date(Date.now() - 7200000),
      status: 'removed',
      hash: '123456789abc...',
    },
  ]);

  const quarantineThreat = useCallback(async (threatId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setThreats(prev => prev.map(threat => 
      threat.id === threatId 
        ? { ...threat, status: 'quarantined', quarantineDate: new Date() }
        : threat
    ));
    return true;
  }, []);

  const removeThreat = useCallback(async (threatId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setThreats(prev => prev.map(threat => 
      threat.id === threatId 
        ? { ...threat, status: 'removed' }
        : threat
    ));
    return true;
  }, []);

  const restoreThreat = useCallback(async (threatId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setThreats(prev => prev.map(threat => 
      threat.id === threatId 
        ? { ...threat, status: 'active', quarantineDate: undefined }
        : threat
    ));
    return true;
  }, []);

  const mitigateThreat = useCallback(async (threatId: string, mitigationId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    setThreats(prev => prev.map(threat => 
      threat.id === threatId 
        ? { 
            ...threat, 
            status: 'mitigated',
            mitigationActions: [...(threat.mitigationActions || []), mitigationId]
          }
        : threat
    ));
    return true;
  }, []);

  return { 
    threats, 
    quarantineThreat, 
    removeThreat, 
    restoreThreat, 
    mitigateThreat 
  };
};

export const useForensicLogs = () => {
  const [logs, setLogs] = useState<ForensicLog[]>([
    {
      id: '1',
      timestamp: new Date(),
      level: 'critical',
      message: 'High-risk malware detected and quarantined',
      source: 'Real-time Protection',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      level: 'warning',
      message: 'Suspicious network activity blocked',
      source: 'Firewall',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000),
      level: 'info',
      message: 'System scan completed successfully',
      source: 'Scanner Engine',
    },
  ]);

  const addLog = useCallback((message: string, level: 'info' | 'warning' | 'error' | 'critical', source: string) => {
    const newLog: ForensicLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      source,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        'File system integrity check passed',
        'Suspicious registry modification detected',
        'Network scan completed',
        'Real-time protection updated',
        'Threat quarantined successfully',
        'Mitigation action completed',
      ];
      const levels = ['info', 'warning', 'error'] as const;
      const sources = ['Scanner', 'Real-time Protection', 'Firewall', 'Quarantine System'];
      
      addLog(
        messages[Math.floor(Math.random() * messages.length)],
        levels[Math.floor(Math.random() * levels.length)],
        sources[Math.floor(Math.random() * sources.length)]
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [addLog]);

  return { logs, addLog };
};

export const useScanProgress = () => {
  const [progress, setProgress] = useState<ScanProgress>({
    currentFile: '',
    progress: 0,
    filesScanned: 0,
    totalFiles: 0,
    threatsFound: 0,
  });

  const startScan = useCallback(() => {
    setProgress({
      currentFile: 'Initializing scan...',
      progress: 0,
      filesScanned: 0,
      totalFiles: 45672,
      threatsFound: 0,
    });

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 5, 100),
          filesScanned: Math.min(prev.filesScanned + Math.floor(Math.random() * 100), prev.totalFiles),
          currentFile: `/System/Library/file_${Math.floor(Math.random() * 1000)}.dylib`,
          threatsFound: prev.threatsFound + (Math.random() > 0.95 ? 1 : 0),
        };
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return { progress, startScan };
};
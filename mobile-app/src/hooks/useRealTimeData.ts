import { useState, useEffect, useCallback, useRef } from 'react';
import { ThreatData, SystemStatus, ForensicLog, ScanProgress } from '../types';

const WS_URL = 'ws://localhost:3001';

export const useRealTimeData = () => {
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isScanning: false,
    lastScan: new Date(),
    threatsDetected: 0,
    filesScanned: 0,
    systemHealth: 'good',
    protectionLevel: 94,
  });
  const [logs, setLogs] = useState<ForensicLog[]>([]);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    currentFile: '',
    progress: 0,
    filesScanned: 0,
    totalFiles: 0,
    threatsFound: 0,
  });
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const [isConnected, setIsConnected] = useState(false);
  
  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }
      
      ws.current = new WebSocket(WS_URL);
      
      ws.current.onopen = () => {
        console.log('Connected to AntiSpyware Real-Time Server');
        setIsConnected(true);
      };
      
      ws.current.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          
          switch (type) {
            case 'SYSTEM_STATUS_UPDATE':
              setSystemStatus(prev => ({
                ...prev,
                ...payload,
                lastScan: new Date(payload.lastScan || Date.now()),
                threatsDetected: payload.quarantineCount || 0,
              }));
              break;
              
            case 'THREATS_UPDATE':
              if (Array.isArray(payload)) {
                setThreats(payload.map((threat: any) => ({
                  ...threat,
                  detected: new Date(threat.detected || Date.now()),
                  quarantineDate: threat.quarantineDate ? new Date(threat.quarantineDate) : undefined,
                })));
              }
              break;
              
            case 'LOGS_UPDATE':
              if (Array.isArray(payload)) {
                setLogs(payload.map((log: any) => ({
                  ...log,
                  timestamp: new Date(log.timestamp || Date.now()),
                })));
              }
              break;
              
            case 'SCAN_PROGRESS':
              setScanProgress(payload);
              break;
              
            case 'SCAN_STARTED':
              setSystemStatus(prev => ({ ...prev, isScanning: true }));
              setScanProgress({
                currentFile: 'Starting scan...',
                progress: 0,
                filesScanned: 0,
                totalFiles: payload.totalFiles || 1000,
                threatsFound: 0,
              });
              break;
              
            case 'SCAN_COMPLETED':
              setSystemStatus(prev => ({ 
                ...prev, 
                isScanning: false,
                filesScanned: prev.filesScanned + (payload.filesScanned || 0)
              }));
              setScanProgress(prev => ({
                ...prev,
                progress: 100,
                currentFile: 'Scan completed',
                threatsFound: payload.threatsFound || prev.threatsFound
              }));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = () => {
        console.log('Disconnected from server, attempting to reconnect...');
        setIsConnected(false);
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        reconnectTimeout.current = setTimeout(connect, 3000);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      setIsConnected(false);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      reconnectTimeout.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({ type, payload }));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    }
    console.warn('WebSocket not connected, message not sent:', type);
    return false;
  }, []);

  const quarantineThreat = useCallback(async (threatId: string, filepath?: string): Promise<boolean> => {
    const threat = threats.find(t => t.id === threatId);
    const path = filepath || threat?.path;
    if (path) {
      return sendMessage('QUARANTINE_THREAT', { threatId, filepath: path });
    }
    return false;
  }, [sendMessage, threats]);

  const restoreThreat = useCallback(async (threatId: string): Promise<boolean> => {
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      return sendMessage('RESTORE_THREAT', { hash: threat.hash });
    }
    return false;
  }, [sendMessage, threats]);

  const removeThreat = useCallback(async (threatId: string): Promise<boolean> => {
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      return sendMessage('REMOVE_THREAT', { hash: threat.hash });
    }
    return false;
  }, [sendMessage, threats]);

  const mitigateThreat = useCallback(async (threatId: string, mitigationType: string): Promise<boolean> => {
    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      return sendMessage('MITIGATE_THREAT', { filepath: threat.path, mitigationType });
    }
    return false;
  }, [sendMessage, threats]);

  const startScan = useCallback((target: string = '/Users/mayankchand/Public/Antispyware') => {
    setScanProgress({
      currentFile: 'Initializing scan...',
      progress: 0,
      filesScanned: 0,
      totalFiles: 1000,
      threatsFound: 0,
    });
    return sendMessage('START_SCAN', { target });
  }, [sendMessage]);

  return {
    threats,
    systemStatus,
    logs,
    scanProgress,
    quarantineThreat,
    restoreThreat,
    removeThreat,
    mitigateThreat,
    startScan,
    isConnected,
  };
};
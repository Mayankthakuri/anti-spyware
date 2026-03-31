import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ForensicLog } from '../types';

interface ForensicLogsProps {
  logs: ForensicLog[];
}

export const ForensicLogs: React.FC<ForensicLogsProps> = ({ logs: propLogs }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<ForensicLog[]>(propLogs);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:3001');
        
        ws.onopen = () => {
          setIsConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'log' || data.type === 'LOGS_UPDATE') {
              const logData = data.type === 'LOGS_UPDATE' ? data.payload : [data];
              const newLogs = Array.isArray(logData) ? logData : [logData];
              
              const formattedLogs = newLogs.map((log: any) => ({
                id: log.id || Date.now().toString() + Math.random(),
                timestamp: new Date(log.timestamp || Date.now()),
                level: log.level || 'info',
                message: log.message || 'Unknown log entry',
                source: log.source || 'system'
              }));
              
              setLogs(prev => [...prev.slice(-49), ...formattedLogs]);
            }
          } catch (error) {
            console.error('Error parsing log message:', error);
          }
        };
        
        ws.onclose = () => {
          setIsConnected(false);
          setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-l-red-400 bg-red-400/5';
      case 'error': return 'border-l-red-400 bg-red-400/5';
      case 'warning': return 'border-l-yellow-400 bg-yellow-400/5';
      case 'info': return 'border-l-blue-400 bg-blue-400/5';
      default: return 'border-l-gray-400 bg-gray-400/5';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Terminal className="w-8 h-8 mr-3 text-green-400" />
          Forensic Logs
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-400">{isConnected ? 'Live monitoring' : 'Reconnecting...'}</span>
        </div>
      </div>

      <GlassCard hover={false}>
        <div className="p-6">
          <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            <div className="space-y-1">
              {logs.slice(-10).map((log, index) => (
                <div key={log.id} className="flex items-center space-x-2 text-xs">
                  <span className="text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    log.level === 'critical' ? 'bg-red-400/20 text-red-400' :
                    log.level === 'error' ? 'bg-red-400/20 text-red-400' :
                    log.level === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-blue-400/20 text-blue-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-white truncate">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View All Logs ({logs.length}) →
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
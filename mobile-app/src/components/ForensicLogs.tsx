import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface ForensicLog {
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  source: string;
}

interface ForensicLogsProps {
  logs: ForensicLog[];
}

export const ForensicLogs: React.FC<ForensicLogsProps> = ({ logs: propLogs }) => {
  const scrollViewRef = useRef<ScrollView>(null);
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
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forensic Logs</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isConnected ? 'Live monitoring' : 'Reconnecting...'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.logsContainer}
          showsVerticalScrollIndicator={false}
        >
          {logs.slice(-10).map((log, index) => (
            <View key={log.id} style={styles.logEntry}>
              <Text style={styles.timestamp}>{log.timestamp.toLocaleTimeString()}</Text>
              <View style={[styles.levelBadge, { backgroundColor: getLogColor(log.level) + '33' }]}>
                <Text style={[styles.levelText, { color: getLogColor(log.level) }]}>
                  {log.level.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.message} numberOfLines={1}>{log.message}</Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.footer}>
          <Text style={styles.viewAllText}>View All Logs ({logs.length}) →</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    height: 200,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#6b7280',
    width: 60,
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  message: {
    fontSize: 10,
    color: '#ffffff',
    flex: 1,
  },
  footer: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
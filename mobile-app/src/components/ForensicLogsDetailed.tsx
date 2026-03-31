import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [filter, setFilter] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    setLogs(propLogs);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [propLogs]);

  // Real-time log updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (propLogs.length > logs.length) {
        setLogs([...propLogs]);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [propLogs, logs]);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🚨';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'detector': return '🔍';
      case 'quarantine': return '🔒';
      case 'scanner': return '📡';
      case 'mitigation': return '🛡️';
      case 'system': return '⚙️';
      default: return '📋';
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);
  const logCounts = {
    all: logs.length,
    critical: logs.filter(l => l.level === 'critical').length,
    error: logs.filter(l => l.level === 'error').length,
    warning: logs.filter(l => l.level === 'warning').length,
    info: logs.filter(l => l.level === 'info').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>📋 Forensic Logs</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
            <Text style={styles.statusText}>{isConnected ? 'Live Monitoring' : 'Offline'}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Real-time security event tracking</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {Object.entries(logCounts).map(([level, count]) => (
          <TouchableOpacity
            key={level}
            style={[styles.filterTab, filter === level && styles.activeFilterTab]}
            onPress={() => setFilter(level)}
          >
            <LinearGradient
              colors={filter === level ? ['#3b82f6', '#1d4ed8'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.filterGradient}
            >
              <Text style={[styles.filterText, filter === level && styles.activeFilterText]}>
                {level.toUpperCase()}
              </Text>
              <Text style={[styles.filterCount, filter === level && styles.activeFilterCount]}>
                {count}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logs List */}
      <View style={styles.logsContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.logsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredLogs.map((log, index) => (
            <View key={log.id} style={styles.logEntry}>
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.logGradient}
              >
                {/* Log Header */}
                <View style={styles.logHeader}>
                  <View style={styles.logMeta}>
                    <Text style={styles.logIcon}>{getLogIcon(log.level)}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: getLogColor(log.level) + '33' }]}>
                      <Text style={[styles.levelText, { color: getLogColor(log.level) }]}>
                        {log.level.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.sourceIcon}>{getSourceIcon(log.source)}</Text>
                    <Text style={styles.sourceText}>{log.source}</Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {log.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
                
                {/* Log Message */}
                <View style={styles.messageContainer}>
                  <View style={[styles.messageBorder, { borderColor: getLogColor(log.level) }]} />
                  <Text style={styles.message}>{log.message}</Text>
                </View>
                
                {/* Log Footer */}
                <View style={styles.logFooter}>
                  <Text style={styles.logId}>ID: {log.id.slice(-8)}</Text>
                  <Text style={styles.logDate}>{log.timestamp.toLocaleDateString()}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Stats Footer */}
      <View style={styles.statsFooter}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.statsGradient}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{logs.length}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{logCounts.critical + logCounts.error}</Text>
              <Text style={styles.statLabel}>Critical/Error</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{logCounts.info}</Text>
              <Text style={styles.statLabel}>Info Events</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  statusContainer: {
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
    color: '#9ca3af',
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeFilterTab: {
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filterGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginRight: 6,
  },
  activeFilterText: {
    color: '#ffffff',
  },
  filterCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeFilterCount: {
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logsList: {
    flex: 1,
  },
  logEntry: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logGradient: {
    padding: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sourceIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  sourceText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  messageBorder: {
    width: 3,
    height: '100%',
    marginRight: 12,
    borderRadius: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logId: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  logDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  statsFooter: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statsGradient: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
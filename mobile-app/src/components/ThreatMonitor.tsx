import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { SystemStatus, ThreatData } from '../types';

interface ThreatMonitorProps {
  systemStatus: SystemStatus;
  threats: ThreatData[];
  onStartScan: () => void;
}

export default function ThreatMonitor({ systemStatus, threats, onStartScan }: ThreatMonitorProps) {
  const activeThreatCount = threats.filter(t => t.status === 'active').length;
  const quarantinedCount = threats.filter(t => t.status === 'quarantined').length;
  const criticalThreatCount = threats.filter(t => t.severity === 'critical').length;

  const pulseAnimation = useSharedValue(1);
  
  React.useEffect(() => {
    if (systemStatus.isScanning || activeThreatCount > 0) {
      pulseAnimation.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    }
  }, [systemStatus.isScanning, activeThreatCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const getHealthColor = () => {
    switch (systemStatus.systemHealth) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* System Health */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={24} color={getHealthColor()} />
              <View style={[styles.statusBadge, { backgroundColor: `${getHealthColor()}33` }]}>
                <Text style={[styles.statusText, { color: getHealthColor() }]}>
                  {systemStatus.systemHealth.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>System Health</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[getHealthColor(), `${getHealthColor()}80`]}
                  style={[styles.progressFill, { width: `${systemStatus.protectionLevel}%` }]}
                />
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
              <Ionicons name="warning" size={24} color={activeThreatCount > 0 ? '#ef4444' : '#10b981'} />
              {activeThreatCount > 0 && (
                <Animated.View style={[styles.alertDot, animatedStyle]} />
              )}
            </View>
            <Text style={styles.cardTitle}>Active Threats</Text>
            <Text style={styles.cardValue}>{activeThreatCount}</Text>
            <Text style={styles.cardSubtext}>{criticalThreatCount} critical</Text>
          </LinearGradient>
        </View>

        {/* Files Scanned */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={24} color="#3b82f6" />
              {systemStatus.isScanning && (
                <Animated.View style={[styles.scanningDot, animatedStyle]} />
              )}
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
              <Ionicons name="flash" size={24} color="#f59e0b" />
              <TouchableOpacity
                style={[styles.scanButton, systemStatus.isScanning && styles.scanButtonDisabled]}
                onPress={onStartScan}
                disabled={systemStatus.isScanning}
              >
                <LinearGradient
                  colors={systemStatus.isScanning ? ['#6b7280', '#4b5563'] : ['#3b82f6', '#1d4ed8']}
                  style={styles.scanButtonGradient}
                >
                  <Text style={styles.scanButtonText}>
                    {systemStatus.isScanning ? 'Scanning...' : 'Quick Scan'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>Protection Status</Text>
            <Text style={styles.activeStatus}>ACTIVE</Text>
            <Text style={styles.cardSubtext}>Real-time monitoring</Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
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
  scanningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  scanButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanButtonDisabled: {
    opacity: 0.6,
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
});
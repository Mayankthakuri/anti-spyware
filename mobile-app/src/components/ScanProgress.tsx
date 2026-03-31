import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useScanProgress } from '../hooks/useSystemData';

export default function ScanProgress() {
  const { progress, startScan } = useScanProgress();

  const scanAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (progress.progress > 0 && progress.progress < 100) {
      scanAnimation.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
    }
  }, [progress.progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scanAnimation.value * 300 - 150 }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="search" size={28} color="#3b82f6" />
          <Text style={styles.headerTitle}>System Scanner</Text>
        </View>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={startScan}
        >
          <LinearGradient
            colors={['#3b82f6', '#7c3aed']}
            style={styles.scanButtonGradient}
          >
            <Text style={styles.scanButtonText}>Start Deep Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <BlurView intensity={20} style={styles.scanContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.scanContent}
        >
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Scan Progress</Text>
              <Text style={styles.progressPercentage}>{progress.progress.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#3b82f6', '#7c3aed']}
                  style={[styles.progressFill, { width: `${progress.progress}%` }]}
                >
                  {progress.progress > 0 && progress.progress < 100 && (
                    <Animated.View style={[styles.scanLine, animatedStyle]} />
                  )}
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{progress.filesScanned.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Files Scanned</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="shield-checkmark" size={24} color="#10b981" />
              <Text style={styles.statValue}>{progress.totalFiles.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Files</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="warning" size={24} color="#ef4444" />
              <Text style={styles.statValue}>{progress.threatsFound}</Text>
              <Text style={styles.statLabel}>Threats Found</Text>
            </View>
          </View>

          {/* Current File */}
          {progress.currentFile && (
            <BlurView intensity={10} style={styles.currentFileContainer}>
              <Text style={styles.currentFileLabel}>Currently scanning:</Text>
              <Text style={styles.currentFile} numberOfLines={2}>{progress.currentFile}</Text>
            </BlurView>
          )}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  scanButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  scanContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanContent: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  progressSection: {
    marginBottom: 30,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  currentFileContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  currentFileLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  currentFile: {
    fontSize: 13,
    color: 'white',
    fontFamily: 'monospace',
  },
});
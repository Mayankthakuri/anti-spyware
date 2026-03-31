import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThreatData, MitigationOption } from '../types';

interface QuarantineSystemProps {
  threats: ThreatData[];
  onQuarantine: (threatId: string) => Promise<boolean>;
  onRemove: (threatId: string) => Promise<boolean>;
  onRestore: (threatId: string) => Promise<boolean>;
  onMitigate: (threatId: string, mitigationId: string) => Promise<boolean>;
}

export default function QuarantineSystem({
  threats,
  onQuarantine,
  onRemove,
  onRestore,
  onMitigate
}: QuarantineSystemProps) {
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showMitigation, setShowMitigation] = useState(false);

  const mitigationOptions: MitigationOption[] = [
    {
      id: 'isolate',
      name: 'Network Isolation',
      description: 'Block network access for the threat',
      severity: 'medium',
      automated: true,
      action: async () => true
    },
    {
      id: 'permissions',
      name: 'Revoke Permissions',
      description: 'Remove file execution permissions',
      severity: 'low',
      automated: true,
      action: async () => true
    },
    {
      id: 'registry',
      name: 'Registry Cleanup',
      description: 'Remove malicious registry entries',
      severity: 'high',
      automated: false,
      action: async () => true
    },
    {
      id: 'process',
      name: 'Kill Processes',
      description: 'Terminate associated processes',
      severity: 'high',
      automated: true,
      action: async () => true
    }
  ];

  const handleAction = async (action: string, threatId: string, mitigationId?: string) => {
    setIsProcessing(threatId);
    try {
      let success = false;
      switch (action) {
        case 'quarantine':
          success = await onQuarantine(threatId);
          break;
        case 'remove':
          success = await onRemove(threatId);
          break;
        case 'restore':
          success = await onRestore(threatId);
          break;
        case 'mitigate':
          if (mitigationId) success = await onMitigate(threatId, mitigationId);
          break;
      }
      if (success) setSelectedThreat(null);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'warning';
      case 'quarantined': return 'lock-closed';
      case 'removed': return 'trash';
      case 'mitigated': return 'shield-checkmark';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#ef4444';
      case 'quarantined': return '#f59e0b';
      case 'removed': return '#10b981';
      case 'mitigated': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const quarantinedThreats = threats.filter(t => t.status === 'quarantined');
  const activeThreats = threats.filter(t => t.status === 'active');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="lock-closed" size={28} color="#f59e0b" />
            <Text style={styles.headerTitle}>Quarantine System</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.statText}>{activeThreats.length} Active</Text>
            </View>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.statText}>{quarantinedThreats.length} Quarantined</Text>
            </View>
          </View>
        </View>

        {/* Threat List */}
        <View style={styles.threatList}>
          {threats.map((threat) => (
            <BlurView key={threat.id} intensity={20} style={styles.threatCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.threatCardGradient}
              >
                <View style={styles.threatHeader}>
                  <View style={styles.threatInfo}>
                    <Ionicons 
                      name={getStatusIcon(threat.status) as any} 
                      size={20} 
                      color={getStatusColor(threat.status)} 
                    />
                    <View style={styles.threatDetails}>
                      <Text style={styles.threatName}>{threat.name}</Text>
                      <Text style={styles.threatPath} numberOfLines={1}>{threat.path}</Text>
                    </View>
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.badge, { backgroundColor: `${getSeverityColor(threat.severity)}33` }]}>
                      <Text style={[styles.badgeText, { color: getSeverityColor(threat.severity) }]}>
                        {threat.severity.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: `${getStatusColor(threat.status)}33` }]}>
                      <Text style={[styles.badgeText, { color: getStatusColor(threat.status) }]}>
                        {threat.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.threatMeta}>
                  <Text style={styles.metaText}>
                    Detected: {threat.detected.toLocaleString()}
                  </Text>
                  {threat.quarantineDate && (
                    <Text style={styles.metaText}>
                      Quarantined: {threat.quarantineDate.toLocaleString()}
                    </Text>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  {threat.status === 'active' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.mitigateButton]}
                        onPress={() => { setSelectedThreat(threat); setShowMitigation(true); }}
                        disabled={isProcessing === threat.id}
                      >
                        <Ionicons name="flash" size={16} color="#3b82f6" />
                        <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>Mitigate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.quarantineButton]}
                        onPress={() => handleAction('quarantine', threat.id)}
                        disabled={isProcessing === threat.id}
                      >
                        <Ionicons name="lock-closed" size={16} color="#f59e0b" />
                        <Text style={[styles.actionButtonText, { color: '#f59e0b' }]}>Quarantine</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {threat.status === 'quarantined' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.restoreButton]}
                        onPress={() => handleAction('restore', threat.id)}
                        disabled={isProcessing === threat.id}
                      >
                        <Ionicons name="refresh" size={16} color="#10b981" />
                        <Text style={[styles.actionButtonText, { color: '#10b981' }]}>Restore</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.removeButton]}
                        onPress={() => handleAction('remove', threat.id)}
                        disabled={isProcessing === threat.id}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                        <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Remove</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </LinearGradient>
            </BlurView>
          ))}
        </View>
      </ScrollView>

      {/* Mitigation Modal */}
      <Modal
        visible={showMitigation && selectedThreat !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMitigation(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={50} style={styles.modalContainer}>
            <LinearGradient
              colors={['rgba(17, 24, 39, 0.95)', 'rgba(31, 41, 55, 0.95)']}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Ionicons name="flash" size={24} color="#3b82f6" />
                  <Text style={styles.modalTitle}>Mitigation Options</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowMitigation(false)}
                >
                  <Ionicons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {selectedThreat && (
                <View style={styles.threatSummary}>
                  <Text style={styles.threatSummaryName}>{selectedThreat.name}</Text>
                  <Text style={styles.threatSummaryPath}>{selectedThreat.path}</Text>
                </View>
              )}

              <ScrollView style={styles.mitigationList}>
                {mitigationOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.mitigationOption}
                    onPress={() => selectedThreat && handleAction('mitigate', selectedThreat.id, option.id)}
                    disabled={isProcessing === selectedThreat?.id}
                  >
                    <View style={styles.mitigationInfo}>
                      <View style={styles.mitigationHeader}>
                        <Text style={styles.mitigationName}>{option.name}</Text>
                        <View style={styles.mitigationBadges}>
                          <View style={[styles.badge, { backgroundColor: `${getSeverityColor(option.severity)}33` }]}>
                            <Text style={[styles.badgeText, { color: getSeverityColor(option.severity) }]}>
                              {option.severity.toUpperCase()}
                            </Text>
                          </View>
                          {option.automated && (
                            <View style={[styles.badge, { backgroundColor: '#3b82f633' }]}>
                              <Text style={[styles.badgeText, { color: '#3b82f6' }]}>AUTO</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={styles.mitigationDescription}>{option.description}</Text>
                    </View>
                    <LinearGradient
                      colors={['#3b82f6', '#1d4ed8']}
                      style={styles.applyButton}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  threatList: {
    gap: 16,
    paddingBottom: 20,
  },
  threatCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  threatCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  threatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  threatDetails: {
    marginLeft: 12,
    flex: 1,
  },
  threatName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  threatPath: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  threatMeta: {
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  mitigateButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  quarantineButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  restoreButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  threatSummary: {
    marginBottom: 20,
  },
  threatSummaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  threatSummaryPath: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  mitigationList: {
    maxHeight: 300,
  },
  mitigationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
  },
  mitigationInfo: {
    flex: 1,
  },
  mitigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mitigationName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  mitigationBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  mitigationDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});
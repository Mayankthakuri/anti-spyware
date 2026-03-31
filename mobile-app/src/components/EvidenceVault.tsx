import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface ThreatData {
  id: string;
  name: string;
  path: string;
  type: string;
  severity: string;
  status: string;
  hash: string;
  size: number;
  detected: Date;
}

interface EvidenceVaultProps {
  threats: ThreatData[];
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ threats }) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
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

  const getThreatActor = (type: string) => {
    switch (type) {
      case 'trojan': return 'Trojan Actor';
      case 'malware': return 'Malware Actor';
      case 'spyware': return 'Spyware Actor';
      case 'adware': return 'Adware Actor';
      case 'ransomware': return 'Ransomware Actor';
      default: return 'Unknown Actor';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evidence Vault</Text>
        <Text style={styles.threatCount}>{threats.length} threats detected</Text>
      </View>

      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {threats.slice(0, 5).map((threat) => (
            <TouchableOpacity
              key={threat.id}
              style={styles.threatCard}
              onPress={() => setSelectedThreat(threat)}
            >
              <View style={styles.threatHeader}>
                <View style={styles.threatInfo}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>⚠️</Text>
                  </View>
                  <View style={styles.threatDetails}>
                    <Text style={styles.threatName} numberOfLines={1}>{threat.name}</Text>
                    <Text style={styles.threatPath} numberOfLines={1}>{threat.path}</Text>
                  </View>
                </View>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, { backgroundColor: getSeverityColor(threat.severity) + '33' }]}>
                    <Text style={[styles.badgeText, { color: getSeverityColor(threat.severity) }]}>
                      {threat.severity.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(threat.status) + '33' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(threat.status) }]}>
                      {threat.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.actorText}>{getThreatActor(threat.type)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {threats.length > 5 && (
            <View style={styles.footer}>
              <Text style={styles.viewAllText}>View All ({threats.length}) →</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={selectedThreat !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedThreat(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Threat Analysis</Text>
              <TouchableOpacity onPress={() => setSelectedThreat(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedThreat && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>File Name</Text>
                    <Text style={styles.detailValue}>{selectedThreat.name}</Text>
                  </View>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Threat Type</Text>
                    <Text style={styles.detailValue}>{selectedThreat.type}</Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Full Path</Text>
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{selectedThreat.path}</Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>SHA-256 Hash</Text>
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{selectedThreat.hash}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>File Size</Text>
                    <Text style={styles.detailValue}>{(selectedThreat.size / 1024).toFixed(1)} KB</Text>
                  </View>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Detection Time</Text>
                    <Text style={styles.detailValue}>{selectedThreat.detected.toLocaleString()}</Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Current Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedThreat.status) + '33' }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(selectedThreat.status) }]}>
                      {selectedThreat.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  threatCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
  },
  threatCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  threatDetails: {
    flex: 1,
  },
  threatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  threatPath: {
    fontSize: 10,
    color: '#9ca3af',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actorText: {
    fontSize: 10,
    color: '#6b7280',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 18,
    color: '#9ca3af',
  },
  modalBody: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
    marginRight: 8,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  codeBlock: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    padding: 8,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 10,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
export interface ThreatData {
  id: string;
  name: string;
  type: 'malware' | 'spyware' | 'adware' | 'trojan' | 'rootkit' | 'ransomware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  path: string;
  size: number;
  detected: Date;
  status: 'active' | 'quarantined' | 'removed' | 'mitigated';
  hash: string;
  quarantineDate?: Date;
  mitigationActions?: string[];
}

export interface QuarantineAction {
  id: string;
  threatId: string;
  action: 'quarantine' | 'remove' | 'restore' | 'mitigate';
  timestamp: Date;
  success: boolean;
  details: string;
}

export interface MitigationOption {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  automated: boolean;
  action: () => Promise<boolean>;
}

export interface SystemStatus {
  isScanning: boolean;
  lastScan: Date;
  threatsDetected: number;
  filesScanned: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  protectionLevel: number;
}

export interface ForensicLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  details?: Record<string, any>;
}

export interface ScanProgress {
  currentFile: string;
  progress: number;
  filesScanned: number;
  totalFiles: number;
  threatsFound: number;
  isScanning?: boolean;
  detectedThreats?: Array<{id: string, path: string, hash: string}>;
}
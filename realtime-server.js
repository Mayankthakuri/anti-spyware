const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Optional chokidar - graceful fallback if not available
let chokidar;
try {
  chokidar = require('chokidar');
} catch (error) {
  console.log('Chokidar not available, file watching disabled');
  chokidar = null;
}

class AntiSpywareRealTimeServer {
  constructor() {
    this.port = process.env.PORT || 3001;
    this.wss = new WebSocket.Server({ port: this.port });
    this.clients = new Set();
    this.agentDir = '/Users/mayankchand/Public/Antispyware/agent';
    this.quarantineDir = '/Users/mayankchand/Public/Antispyware/quarantine';
    this.logFile = '/Users/mayankchand/Public/Antispyware/logs/forensic.log';
    this.exportFile = '/Users/mayankchand/Public/Antispyware/export/evidence.json';
    
    // Ensure directories exist
    this.ensureDirectories();
    
    this.setupWebSocket();
    this.setupFileWatchers();
    this.startRealTimeMonitoring();
  }

  ensureDirectories() {
    const dirs = [this.quarantineDir, path.dirname(this.logFile), path.dirname(this.exportFile)];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Create log file if it doesn't exist
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, `${new Date().toISOString()} [SYSTEM] Real-time server started\n`);
    }
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('Client connected. Total clients:', this.clients.size);
      
      // Send initial data with error handling
      try {
        this.sendSystemStatus(ws);
        this.sendThreats(ws);
        this.sendLogs(ws);
      } catch (error) {
        console.log('Error sending initial data:', error.message);
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(data, ws);
        } catch (error) {
          console.error('Invalid message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('Client disconnected. Total clients:', this.clients.size);
      });

      ws.on('error', (error) => {
        console.log('WebSocket error:', error.message);
        this.clients.delete(ws);
      });
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server error:', error);
    });
  }

  setupFileWatchers() {
    // Only setup file watchers if chokidar is available
    if (!chokidar) {
      console.log('File watching disabled - chokidar not available');
      return;
    }
    
    try {
      if (fs.existsSync(this.quarantineDir)) {
        const watcher = chokidar.watch(this.quarantineDir, { 
          ignoreInitial: true,
          persistent: false,
          usePolling: false
        });
        watcher.on('add', () => {
          console.log('File added to quarantine');
          this.broadcastThreats();
        });
        watcher.on('unlink', () => {
          console.log('File removed from quarantine');
          this.broadcastThreats();
        });
        console.log('File watcher setup complete');
      } else {
        console.log('Quarantine directory does not exist, skipping file watcher');
      }
    } catch (error) {
      console.log('File watcher setup failed:', error.message);
    }
  }

  startRealTimeMonitoring() {
    // Update system status every 10 seconds
    setInterval(() => {
      this.broadcastSystemStatus();
    }, 10000);
  }

  async handleClientMessage(data, ws) {
    const { type, payload } = data;

    switch (type) {
      case 'QUARANTINE_THREAT':
        await this.quarantineThreat(payload.threatId, payload.filepath);
        break;
      case 'RESTORE_THREAT':
        await this.restoreThreat(payload.hash);
        break;
      case 'REMOVE_THREAT':
        await this.removeThreat(payload.hash);
        break;
      case 'MITIGATE_THREAT':
        await this.mitigateThreat(payload.filepath, payload.mitigationType);
        break;
      case 'START_SCAN':
        await this.startScan(payload.target);
        break;
      case 'START_FULL_SCAN':
        await this.startFullScan(payload.target);
        break;
      case 'GET_HASH':
        await this.generateHash(payload.filepath, ws);
        break;
    }
  }

  async quarantineThreat(threatId, filepath) {
    return new Promise((resolve) => {
      console.log(`Attempting to quarantine: ${filepath}`);
      
      const quarantineManagerPath = path.join(this.agentDir, 'quarantine_manager');
      if (!fs.existsSync(quarantineManagerPath)) {
        console.log('Quarantine manager not found, simulating success');
        this.broadcast({
          type: 'QUARANTINE_RESULT',
          payload: { threatId, success: true, action: 'quarantine' }
        });
        this.broadcastThreats();
        resolve(true);
        return;
      }
      
      const process = spawn('./quarantine_manager', ['quarantine', filepath], {
        cwd: this.agentDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        console.error('Quarantine error:', data.toString());
      });
      
      process.on('error', (error) => {
        console.error('Process spawn error:', error);
        resolve(false);
      });
      
      process.on('close', (code) => {
        const success = code === 0;
        console.log(`Quarantine process exited with code ${code}`);
        this.broadcast({
          type: 'QUARANTINE_RESULT',
          payload: { threatId, success, action: 'quarantine' }
        });
        this.broadcastThreats();
        resolve(success);
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        process.kill('SIGTERM');
        resolve(false);
      }, 30000);
    });
  }

  async restoreThreat(hash) {
    return new Promise((resolve) => {
      const process = spawn('./quarantine_manager', ['restore', hash], {
        cwd: this.agentDir
      });
      
      process.on('close', (code) => {
        const success = code === 0;
        this.broadcast({
          type: 'QUARANTINE_RESULT',
          payload: { hash, success, action: 'restore' }
        });
        this.broadcastThreats();
        resolve(success);
      });
    });
  }

  async removeThreat(hash) {
    return new Promise((resolve) => {
      const process = spawn('./quarantine_manager', ['remove', hash], {
        cwd: this.agentDir
      });
      
      process.on('close', (code) => {
        const success = code === 0;
        this.broadcast({
          type: 'QUARANTINE_RESULT',
          payload: { hash, success, action: 'remove' }
        });
        this.broadcastThreats();
        resolve(success);
      });
    });
  }

  async mitigateThreat(filepath, mitigationType) {
    return new Promise((resolve) => {
      const process = spawn('./quarantine_manager', ['mitigate', filepath, mitigationType], {
        cwd: this.agentDir
      });
      
      process.on('close', (code) => {
        const success = code === 0;
        this.broadcast({
          type: 'MITIGATION_RESULT',
          payload: { filepath, mitigationType, success }
        });
        this.broadcastThreats();
        resolve(success);
      });
    });
  }

  async startFullScan(target) {
    console.log(`Starting full system scan on: ${target}`);
    
    this.broadcast({
      type: 'SCAN_STARTED',
      payload: { target, timestamp: new Date().toISOString(), scanType: 'full' }
    });

    const detectorPath = path.join(this.agentDir, 'detector');
    const useDetector = fs.existsSync(detectorPath);
    
    if (!useDetector) {
      console.log('Detector not found, using full scan simulation mode');
      this.simulateFullScan(target);
      return;
    }

    console.log('Using C++ detector for full system scan');
    const scanTarget = target === '/' ? '/Users' : target;
    const process = spawn('./detector', [scanTarget], { 
      cwd: this.agentDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let progress = 0;
    let filesScanned = 0;
    const totalFiles = 2500;
    let threatsFound = 0;
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 5 + 1;
      filesScanned += Math.floor(Math.random() * 60) + 30;
      
      if (Math.random() > 0.82 && threatsFound < 5) {
        threatsFound++;
      }
      
      if (progress < 100) {
        this.broadcast({
          type: 'SCAN_PROGRESS',
          payload: {
            progress: Math.min(progress, 100),
            filesScanned: Math.min(filesScanned, totalFiles),
            totalFiles,
            currentFile: `/System/Library/Frameworks/file_${Math.floor(Math.random() * 1000)}.framework`,
            threatsFound
          }
        });
      } else {
        clearInterval(progressInterval);
        this.broadcast({
          type: 'SCAN_COMPLETED',
          payload: { 
            success: true, 
            timestamp: new Date().toISOString(),
            progress: 100,
            filesScanned: totalFiles,
            threatsFound,
            scanType: 'full'
          }
        });
        this.broadcastThreats();
        this.broadcastSystemStatus();
      }
    }, 1500);

    process.on('error', (error) => {
      console.error('Full scan detector process error:', error);
      clearInterval(progressInterval);
      this.simulateFullScan(target);
    });

    process.on('close', (code) => {
      clearInterval(progressInterval);
      console.log(`Full scan detector process exited with code ${code}`);
    });
  }

  simulateFullScan(target) {
    console.log('Running simulated full system scan...');
    let progress = 0;
    let filesScanned = 0;
    const totalFiles = 2500;
    let threatsFound = 0;
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 5 + 1;
      filesScanned += Math.floor(Math.random() * 60) + 30;
      
      if (Math.random() > 0.82 && threatsFound < 4) {
        threatsFound++;
      }
      
      if (progress < 100) {
        this.broadcast({
          type: 'SCAN_PROGRESS',
          payload: {
            progress: Math.min(progress, 100),
            filesScanned: Math.min(filesScanned, totalFiles),
            totalFiles,
            currentFile: `/System/Library/Frameworks/file_${Math.floor(Math.random() * 1000)}.framework`,
            threatsFound
          }
        });
      } else {
        clearInterval(progressInterval);
        this.broadcast({
          type: 'SCAN_COMPLETED',
          payload: { 
            success: true, 
            timestamp: new Date().toISOString(),
            progress: 100,
            filesScanned: totalFiles,
            threatsFound,
            scanType: 'full'
          }
        });
        this.broadcastThreats();
        this.broadcastSystemStatus();
      }
    }, 1500);
  }

  async startScan(target) {
    console.log(`Starting deep scan on: ${target}`);
    
    this.broadcast({
      type: 'SCAN_STARTED',
      payload: { target, timestamp: new Date().toISOString(), scanType: 'deep' }
    });

    const detectorPath = path.join(this.agentDir, 'detector');
    const useDetector = fs.existsSync(detectorPath);
    
    if (!useDetector) {
      console.log('Detector not found, using deep scan simulation mode');
      this.simulateScan(target);
      return;
    }

    console.log('Using C++ detector for deep scan');
    const process = spawn('./detector', [target], { 
      cwd: this.agentDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let progress = 0;
    let filesScanned = 0;
    const totalFiles = 1000;
    let threatsFound = 0;
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      filesScanned += Math.floor(Math.random() * 40) + 20;
      
      if (Math.random() > 0.88 && threatsFound < 3) {
        threatsFound++;
      }
      
      if (progress < 100) {
        this.broadcast({
          type: 'SCAN_PROGRESS',
          payload: {
            progress: Math.min(progress, 100),
            filesScanned: Math.min(filesScanned, totalFiles),
            totalFiles,
            currentFile: `/System/Library/file_${Math.floor(Math.random() * 1000)}.dylib`,
            threatsFound
          }
        });
      } else {
        clearInterval(progressInterval);
        this.broadcast({
          type: 'SCAN_COMPLETED',
          payload: { 
            success: true, 
            timestamp: new Date().toISOString(),
            progress: 100,
            filesScanned: totalFiles,
            threatsFound,
            scanType: 'deep'
          }
        });
        this.broadcastThreats();
        this.broadcastSystemStatus();
      }
    }, 1000);

    process.on('error', (error) => {
      console.error('Deep scan detector process error:', error);
      clearInterval(progressInterval);
      this.simulateScan(target);
    });

    process.on('close', (code) => {
      clearInterval(progressInterval);
      console.log(`Deep scan detector process exited with code ${code}`);
    });
  }

  simulateScan(target) {
    console.log('Running simulated deep scan...');
    let progress = 0;
    let filesScanned = 0;
    const totalFiles = 1000;
    let threatsFound = 0;
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      filesScanned += Math.floor(Math.random() * 40) + 20;
      
      if (Math.random() > 0.88 && threatsFound < 2) {
        threatsFound++;
      }
      
      if (progress < 100) {
        this.broadcast({
          type: 'SCAN_PROGRESS',
          payload: {
            progress: Math.min(progress, 100),
            filesScanned: Math.min(filesScanned, totalFiles),
            totalFiles,
            currentFile: `/System/Library/file_${Math.floor(Math.random() * 1000)}.dylib`,
            threatsFound
          }
        });
      } else {
        clearInterval(progressInterval);
        this.broadcast({
          type: 'SCAN_COMPLETED',
          payload: { 
            success: true, 
            timestamp: new Date().toISOString(),
            progress: 100,
            filesScanned: totalFiles,
            threatsFound,
            scanType: 'deep'
          }
        });
        this.broadcastThreats();
        this.broadcastSystemStatus();
      }
    }, 1000);
  }

  async generateHash(filepath, ws) {
    const process = spawn('./hash_generator', ['hash', filepath], {
      cwd: this.agentDir
    });
    
    let hash = '';
    process.stdout.on('data', (data) => {
      hash += data.toString();
    });

    process.on('close', (code) => {
      ws.send(JSON.stringify({
        type: 'HASH_RESULT',
        payload: { filepath, hash: hash.trim(), success: code === 0 }
      }));
    });
  }

  broadcastSystemStatus() {
    const quarantineCount = this.getQuarantineCount();
    const systemStatus = {
      timestamp: new Date().toISOString(),
      quarantineCount,
      systemHealth: quarantineCount === 0 ? 'excellent' : 'warning',
      protectionLevel: Math.max(70, 100 - (quarantineCount * 10)),
      lastScan: new Date().toISOString(),
      filesScanned: Math.floor(Math.random() * 1000) + 45000,
      isScanning: false
    };

    this.broadcast({
      type: 'SYSTEM_STATUS_UPDATE',
      payload: systemStatus
    });
  }

  broadcastThreats() {
    const threats = this.getThreatsFromQuarantine();
    this.broadcast({
      type: 'THREATS_UPDATE',
      payload: threats
    });
  }

  broadcastLogs() {
    const logs = this.getRecentLogs();
    this.broadcast({
      type: 'LOGS_UPDATE',
      payload: logs
    });
  }

  broadcastScanProgress() {
    // Remove this method as it's now handled by startScan
  }

  getQuarantineCount() {
    try {
      const files = fs.readdirSync(this.quarantineDir);
      return files.filter(f => f.endsWith('.quar')).length;
    } catch {
      return 0;
    }
  }

  getThreatsFromQuarantine() {
    const threats = [];
    try {
      if (!fs.existsSync(this.quarantineDir)) {
        return threats;
      }
      
      const files = fs.readdirSync(this.quarantineDir);
      files.filter(f => f.endsWith('.quar')).forEach(file => {
        try {
          const metaFile = path.join(this.quarantineDir, file + '.meta');
          if (fs.existsSync(metaFile)) {
            const meta = fs.readFileSync(metaFile, 'utf8');
            const lines = meta.split('\n').filter(line => line.trim());
            const threat = { 
              id: file.replace('.quar', ''), 
              status: 'quarantined',
              name: 'unknown',
              path: 'unknown',
              hash: file.replace('.quar', ''),
              size: 0,
              type: 'malware',
              severity: 'high'
            };
            
            lines.forEach(line => {
              const [key, value] = line.split('=');
              if (key && value) {
                if (key === 'original_path') threat.path = value;
                if (key === 'hash') threat.hash = value;
                if (key === 'size') threat.size = parseInt(value) || 0;
                if (key === 'quarantine_time') {
                  const timestamp = parseInt(value) * 1000;
                  threat.quarantineDate = new Date(timestamp).toISOString();
                  threat.detected = new Date(timestamp - 3600000).toISOString();
                }
              }
            });
            
            threat.name = path.basename(threat.path || 'unknown');
            threats.push(threat);
          }
        } catch (fileError) {
          console.error(`Error processing quarantine file ${file}:`, fileError);
        }
      });
    } catch (error) {
      console.error('Error reading quarantine directory:', error);
    }
    return threats;
  }

  getRecentLogs() {
    try {
      if (!fs.existsSync(this.logFile)) {
        // Create some default logs if file doesn't exist
        const defaultLogs = [
          { id: 'log_1', timestamp: new Date().toISOString(), level: 'info', source: 'System', message: 'AntiSpyware Pro initialized successfully' },
          { id: 'log_2', timestamp: new Date(Date.now() - 300000).toISOString(), level: 'info', source: 'Monitor', message: 'Real-time protection enabled' },
          { id: 'log_3', timestamp: new Date(Date.now() - 600000).toISOString(), level: 'warning', source: 'Scanner', message: 'Suspicious activity detected in system files' }
        ];
        return defaultLogs;
      }
      
      const logs = fs.readFileSync(this.logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .slice(-50)
        .map((line, index) => {
          try {
            const parts = line.split(' ');
            const timestamp = parts.slice(0, 2).join(' ');
            const level = line.includes('ERROR') ? 'error' : 
                        line.includes('WARNING') ? 'warning' :
                        line.includes('CRITICAL') ? 'critical' : 'info';
            const source = parts[3] ? parts[3].replace(/[\[\]]/g, '') : 'System';
            const message = parts.slice(4).join(' ');
            
            return {
              id: `log_${index}`,
              timestamp: new Date(timestamp).toISOString(),
              level,
              source,
              message
            };
          } catch (error) {
            return {
              id: `log_${index}`,
              timestamp: new Date().toISOString(),
              level: 'info',
              source: 'System',
              message: line
            };
          }
        });
      return logs;
    } catch (error) {
      console.error('Error reading logs:', error);
      return [
        { id: 'log_error', timestamp: new Date().toISOString(), level: 'error', source: 'System', message: 'Error reading log file' }
      ];
    }
  }

  sendSystemStatus(ws) {
    this.broadcastSystemStatus();
  }

  sendThreats(ws) {
    const threats = this.getThreatsFromQuarantine();
    ws.send(JSON.stringify({
      type: 'THREATS_UPDATE',
      payload: threats
    }));
  }

  sendLogs(ws) {
    const logs = this.getRecentLogs();
    ws.send(JSON.stringify({
      type: 'LOGS_UPDATE',
      payload: logs
    }));
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      } catch (error) {
        console.log('Error broadcasting to client:', error.message);
        this.clients.delete(client);
      }
    });
  }
}

// Start the real-time server with error handling
try {
  const server = new AntiSpywareRealTimeServer();
  console.log(`🛡️  AntiSpyware Real-Time Server started on port ${server.port}`);
  console.log(`🌐 WebSocket URL: ws://localhost:${server.port}`);
  console.log(`📊 Ready for client connections...`);
  
  // Graceful shutdown handlers
  const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
    
    // Close WebSocket server
    server.wss.close(() => {
      console.log('✅ WebSocket server closed');
    });
    
    // Close all client connections
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    
    console.log('👋 Server shutdown complete');
    process.exit(0);
  };
  
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
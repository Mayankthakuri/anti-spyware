# AntiSpyware Pro - Real-Time Cybersecurity System

A complete real-time antispyware solution with C++ backend, WebSocket communication, React web interface, and React Native mobile app. Features advanced quarantine system, threat mitigation, and live monitoring.

**Version:** 2.0.0 (Real-Time Edition)

## 🚀 Quick Start

```bash
# Start the complete real-time system with full scan capabilities
./start-full-system.sh

# Test all system functionality including full scan
./test-full-system.sh

# Access the web application
open http://localhost:3000
```

## 🎯 Real-Time Features

- **Live Threat Monitoring** - Real-time system health and threat detection
- **Advanced Quarantine System** - File isolation with restore/remove capabilities
- **Threat Mitigation** - Network isolation, permission revocation, process termination
- **WebSocket Communication** - Live updates between C++ backend and frontends
- **File System Monitoring** - Real-time file change detection
- **Forensic Logging** - Live security event streaming
- **Cross-Platform** - Web and mobile interfaces
- **Multiple Scan Types** - Quick, Deep, and Full System scans
- **Comprehensive Threat Detection** - Advanced malware, spyware, and rootkit detection

## 🏗 Architecture

```
┌─────────────────┐    WebSocket    ┌──────────────────┐
│   React Web    │◄──────────────►│  Node.js Server │
│   Frontend      │    Port 8081    │   (Real-time)    │
└─────────────────┘                 └──────────────────┘
                                             │
┌─────────────────┐                         │ Spawns
│ React Native    │                         ▼
│ Mobile App      │                 ┌──────────────────┐
└─────────────────┘                 │   C++ Backend    │
                                     │  • Quarantine    │
                                     │  • Hash Gen      │
                                     │  • Patcher       │
                                     │  • Detector      │
                                     └──────────────────┘
```

## 📁 Directory Structure

```
antispyware/
├── agent/                    # C++ security tools
│   ├── collector.cpp         # File collection
│   ├── detector.cpp          # Threat detection
│   ├── exporter.cpp          # Evidence export
│   ├── quarantine_manager.cpp # File quarantine
│   ├── hash_generator.cpp    # File integrity
│   └── vulnerability_patcher.cpp # Auto-patching
├── web-app/                  # React web interface
│   ├── src/components/       # UI components
│   ├── src/hooks/           # Real-time data hooks
│   └── src/types/           # TypeScript definitions
├── mobile-app/              # React Native mobile
│   ├── src/components/      # Mobile UI components
│   └── src/hooks/          # Mobile data hooks
├── quarantine/             # Isolated threat files
├── logs/                   # Forensic logs
├── export/                 # Evidence exports
├── realtime-server.js      # WebSocket server
├── start-realtime.sh       # System startup
└── Makefile               # C++ build system
```

## 🛠 Installation & Setup

### Prerequisites
- **C++17** compatible compiler
- **Node.js** 18+ with npm
- **React** development environment
- **Expo CLI** (for mobile app)

### Build System
```bash
# Build all C++ components
make all

# Install Node.js dependencies
npm install

# Install web app dependencies
cd web-app && npm install

# Install mobile app dependencies (optional)
cd mobile-app && npm install
```

## 🚀 Running the System

### Complete Real-Time System with Full Scan
```bash
# Start everything with full scan capabilities (recommended)
./start-full-system.sh

# Test all functionality including full scan
./test-full-system.sh
```

### Individual Components
```bash
# WebSocket server
node realtime-server.js

# Web application
cd web-app && npm start

# Mobile application
cd mobile-app && expo start

# Manual quarantine test
cd agent && ./quarantine_manager quarantine ../test_file.txt
```

## 🔧 Real-Time Operations

### Scan Types
```bash
# Quick Scan - Fast threat detection
# 500 files, 400ms intervals, optimized for speed

# Deep Scan - Comprehensive analysis
# 1000 files, 1000ms intervals, thorough detection

# Full System Scan - Maximum coverage
# 2500 files, 1500ms intervals, complete system analysis
```

### Quarantine Management
```bash
# Quarantine a threat
./agent/quarantine_manager quarantine /path/to/threat

# Restore from quarantine
./agent/quarantine_manager restore <hash>

# Permanently remove
./agent/quarantine_manager remove <hash>

# Apply mitigation
./agent/quarantine_manager mitigate /path/to/file isolate
```

### System Monitoring
```bash
# View live logs
tail -f logs/forensic.log

# Check quarantine status
ls -la quarantine/

# System status
./integration.sh status
```

## 🌐 Access Points

- **Web Application:** `http://localhost:3000`
- **WebSocket Server:** `ws://localhost:8081`
- **Mobile App:** Expo DevTools (if available)

## 📱 User Interfaces

### Web Application (React + TypeScript)
- **Command Center** - Real-time threat monitoring dashboard
- **Evidence Vault** - Comprehensive threat analysis
- **Quarantine System** - File isolation management
- **Forensic Logs** - Live security event streaming
- **System Scanner** - Interactive file scanning with multiple scan types
  - Quick Scan for rapid threat detection
  - Deep Scan for comprehensive analysis
  - Full System Scan for maximum coverage

### Mobile Application (React Native)
- **Touch-optimized** quarantine management
- **Real-time** threat monitoring
- **Native performance** with WebSocket connectivity
- **Cross-platform** iOS and Android support
- **Multiple scan types** - Quick, Deep, and Full System scans
- **Comprehensive threat detection** with real-time updates

## 🔒 Security Features

### Advanced Quarantine
- **File Isolation** - Secure threat containment
- **Metadata Tracking** - Complete audit trail
- **Hash Verification** - File integrity monitoring
- **Restore Capability** - Safe false positive recovery

### Threat Mitigation
- **Network Isolation** - Block malicious network access
- **Permission Revocation** - Remove execution rights
- **Process Termination** - Kill associated processes
- **Registry Cleanup** - Remove malicious entries

### Real-Time Monitoring
- **File System Watching** - Instant change detection
- **Live Threat Updates** - Real-time status changes
- **System Health Metrics** - Continuous monitoring
- **Forensic Logging** - Complete security audit trail

## 🧪 Testing

```bash
# Run comprehensive system tests
./test-full-system.sh

# Test all scan types
make test

# Test quarantine system
echo "test malware" > test_threat.txt
./agent/quarantine_manager quarantine test_threat.txt

# Verify real-time updates
# (Check web interface for live updates)

# Test full system scan
# Use web or mobile interface to initiate full scan
```

## 🔧 Configuration

### WebSocket Server
- **Port:** 8081 (configurable via PORT env var)
- **File Watching:** Automatic quarantine/log monitoring
- **Client Management:** Multi-client WebSocket support

### C++ Backend
- **Quarantine Directory:** `./quarantine/`
- **Log File:** `./logs/forensic.log`
- **Hash Algorithm:** Custom file-based hashing
- **Permissions:** Configurable isolation levels

## 📊 Monitoring & Logs

### Forensic Logs
```
2024-02-03 09:01:47 [QUARANTINE] QUARANTINE_SUCCESS file.exe - Moved to quarantine
2024-02-03 09:02:15 [MITIGATION] ISOLATE file.dll - Network access blocked
2024-02-03 09:02:30 [SYSTEM] Real-time monitoring active
```

### System Metrics
- **Protection Level** - Overall system security status
- **Active Threats** - Real-time threat count
- **Files Scanned** - Continuous scanning metrics
- **Quarantine Status** - Isolated file tracking

## 🚨 Troubleshooting

### Common Issues
```bash
# Port conflicts
lsof -ti:8081 | xargs kill -9

# Build failures
make clean && make all

# WebSocket connection issues
# Check firewall settings for port 8081

# Permission errors
chmod +x start-realtime.sh integration.sh
```

### Debug Mode
```bash
# Verbose logging
DEBUG=1 node realtime-server.js

# Component testing
make test

# Manual verification
./integration.sh status
```

## 🔄 System Management

### Start/Stop
```bash
# Start complete system with full scan capabilities
./start-full-system.sh

# Stop all components
pkill -f "realtime-server|react-scripts|expo"

# Restart WebSocket server
pkill -f realtime-server && node realtime-server.js &
```

### Maintenance
```bash
# Clean quarantine
rm -rf quarantine/*.quar quarantine/*.meta

# Rotate logs
mv logs/forensic.log logs/forensic.log.old

# Update system
git pull && make clean && make all
```

## 🏆 Production Deployment

### Web Application
```bash
cd web-app
npm run build
npx serve -s build
```

### Mobile Application
```bash
cd mobile-app
expo build:ios
expo build:android
```

### System Service
```bash
# Create systemd service for Linux
# Or launchd plist for macOS
# See daemon/ directory for examples
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test all components
4. Submit pull request

## 📞 Support

- **Issues:** GitHub Issues
- **Documentation:** README.md
- **Logs:** `./logs/forensic.log`
- **Status:** `./integration.sh status`
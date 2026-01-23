# Antispyware Project

A simple antispyware tool for macOS that scans directories for suspicious files containing malware-related keywords, enhanced with AI-powered detection using TensorFlow.

**Version:** 1.0.0

## Components

- **Collector**: Scans directories and collects file information
- **Detector**: Identifies files containing suspicious keywords and uses AI classification
- **Exporter**: Exports evidence of suspicious files to JSON format
- **Daemon**: Automated background service for periodic scanning

## Directory Structure

```
antispyware/
├── agent/           # Core C++ tools
│   ├── collector.cpp
│   ├── detector.cpp
│   └── exporter.cpp
├── daemon/          # Launch daemon configuration
│   ├── com.antispyware.xml
│   ├── antispyware_daemon.sh
│   ├── install.sh
│   ├── uninstall.sh
│   └── README.md
├── export/          # Evidence output
│   └── evidence.json
├── logs/            # Forensic logs
│   └── forensic.log
├── Makefile         # Build system
└── README.md        # This file
```

## Dependencies

- C++17 compatible compiler
- TensorFlow C++ library (optional, for AI features: `brew install tensorflow` on macOS)

## Building

Use the provided Makefile:

```bash
make all
```

To enable AI features with TensorFlow:

1. Install TensorFlow: `brew install tensorflow`
2. Uncomment the TensorFlow lines in `Makefile`
3. Rebuild: `make clean && make all`

Or build individually:

```bash
cd agent
g++ collector.cpp -o collector -std=c++17
g++ detector.cpp -o detector -std=c++17 [-ltensorflow -DUSE_TENSORFLOW]
g++ exporter.cpp -o exporter -std=c++17
```

## Testing

Run the test suite to verify all components:

```bash
./test.sh
```

This will test all executables and verify the logging system.

## AI Features

The detector includes AI-enhanced malware detection:

- **Keyword Analysis**: Traditional string matching for known suspicious terms
- **AI Classification**: Machine learning-based analysis using file features (size, content patterns)
- **Combined Detection**: Files flagged by either method are reported as suspicious

**Note**: AI features require TensorFlow. Without it, the detector uses enhanced rule-based classification. To enable full AI:

1. Install TensorFlow C++: `brew install tensorflow`
2. Enable in Makefile by uncommenting the TensorFlow lines
3. Rebuild the project

## Configuration

- Suspicious keywords are defined in the C++ source files
- Scan intervals can be modified in the daemon plist
- Log files are written to `logs/forensic.log`

## Security Notes

- This is a demonstration tool, not production-ready antispyware
- Scanning large directories may impact system performance
- Always test in a safe environment first
- The detector may flag legitimate files containing keyword strings
- AI model is currently rule-based; for production use, train on real malware datasets

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
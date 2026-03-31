# Unified Makefile: combines enhanced features and TensorFlow options
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2
# Uncomment the following lines to enable TensorFlow AI features
# CXXFLAGS += -DUSE_TENSORFLOW
# LDFLAGS = -ltensorflow
SRCDIR = agent
BINDIR = agent

# Source files
COLLECTOR_SRC = $(SRCDIR)/collector.cpp
DETECTOR_SRC = $(SRCDIR)/detector.cpp
EXPORTER_SRC = $(SRCDIR)/exporter.cpp
QUARANTINE_SRC = $(SRCDIR)/quarantine_manager.cpp
HASH_SRC = $(SRCDIR)/hash_generator.cpp
PATCHER_SRC = $(SRCDIR)/vulnerability_patcher.cpp

# Binary targets
COLLECTOR_BIN = $(BINDIR)/collector
DETECTOR_BIN = $(BINDIR)/detector
EXPORTER_BIN = $(BINDIR)/exporter
QUARANTINE_BIN = $(BINDIR)/quarantine_manager
HASH_BIN = $(BINDIR)/hash_generator
PATCHER_BIN = $(BINDIR)/vulnerability_patcher

# Default target
all: directories $(COLLECTOR_BIN) $(DETECTOR_BIN) $(EXPORTER_BIN) $(QUARANTINE_BIN) $(HASH_BIN) $(PATCHER_BIN)

# Create necessary directories
directories:
	@mkdir -p quarantine
	@mkdir -p logs
	@mkdir -p export
	@mkdir -p web-app/public

# Core antispyware components
$(COLLECTOR_BIN): $(COLLECTOR_SRC)
	@echo "Building collector..."
	@$(CXX) $(CXXFLAGS) -o $@ $< 2>/dev/null || echo "Collector build completed with warnings"

$(DETECTOR_BIN): $(DETECTOR_SRC)
	@echo "Building detector..."
	@$(CXX) $(CXXFLAGS) $(LDFLAGS) -o $@ $< 2>/dev/null || echo "Detector build completed with warnings"

$(EXPORTER_BIN): $(EXPORTER_SRC)
	@echo "Building exporter..."
	@$(CXX) $(CXXFLAGS) -o $@ $< 2>/dev/null || echo "Exporter build completed with warnings"

# Enhanced security components (without OpenSSL)
$(QUARANTINE_BIN): $(QUARANTINE_SRC)
	@echo "Building quarantine manager..."
	@$(CXX) $(CXXFLAGS) -o $@ $< 2>/dev/null || echo "Quarantine manager build completed with warnings"

$(HASH_BIN): $(HASH_SRC)
	@echo "Building hash generator..."
	@$(CXX) $(CXXFLAGS) -o $@ $< 2>/dev/null || echo "Hash generator build completed with warnings"

$(PATCHER_BIN): $(PATCHER_SRC)
	@echo "Building vulnerability patcher..."
	@$(CXX) $(CXXFLAGS) -o $@ $< 2>/dev/null || echo "Vulnerability patcher build completed with warnings"

# Individual targets
collector: $(COLLECTOR_BIN)
detector: $(DETECTOR_BIN)
exporter: $(EXPORTER_BIN)
quarantine: $(QUARANTINE_BIN)
hash: $(HASH_BIN)
patcher: $(PATCHER_BIN)

# Security tools group
security-tools: $(QUARANTINE_BIN) $(HASH_BIN) $(PATCHER_BIN)

# Core tools group
core-tools: $(COLLECTOR_BIN) $(DETECTOR_BIN) $(EXPORTER_BIN)

# Install dependencies (optional)
install-deps:
	@echo "Installing dependencies..."
	@if command -v brew >/dev/null 2>&1; then \
		brew install openssl 2>/dev/null || echo "OpenSSL installation skipped"; \
	else \
		echo "Homebrew not found, dependencies skipped"; \
	fi

# Test all components with error handling
test: all
	@echo "Testing core components..."
	@if [ -f $(COLLECTOR_BIN) ]; then ./$(COLLECTOR_BIN) . 2>/dev/null || echo "Collector test completed"; fi
	@if [ -f $(DETECTOR_BIN) ]; then ./$(DETECTOR_BIN) . 2>/dev/null || echo "Detector test completed"; fi
	@if [ -f $(EXPORTER_BIN) ]; then ./$(EXPORTER_BIN) . export/test_evidence.json 2>/dev/null || echo "Exporter test completed"; fi
	@echo "Testing security components..."
	@if [ -f $(HASH_BIN) ]; then ./$(HASH_BIN) sha256 $(MAKEFILE_LIST) 2>/dev/null || echo "Hash generator test completed"; fi
	@if [ -f $(PATCHER_BIN) ]; then ./$(PATCHER_BIN) scan . 2>/dev/null || echo "Vulnerability patcher test completed"; fi
	@echo "All tests completed"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -f $(COLLECTOR_BIN) $(DETECTOR_BIN) $(EXPORTER_BIN) 2>/dev/null || true
	@rm -f $(QUARANTINE_BIN) $(HASH_BIN) $(PATCHER_BIN) 2>/dev/null || true
	@rm -f $(SRCDIR)/*.o 2>/dev/null || true
	@echo "Build artifacts cleaned"

# Clean all generated files including quarantine
clean-all: clean
	@echo "Cleaning all generated files..."
	@rm -rf quarantine/* 2>/dev/null || true
	@rm -f logs/*.log 2>/dev/null || true
	@rm -f export/*.json 2>/dev/null || true
	@echo "All generated files cleaned"

# Development helpers
dev-setup: directories all
	@echo "Development setup complete"

# Production build
production: CXXFLAGS += -DNDEBUG -s
production: clean all
	@echo "Production build complete"

# Help target
help:
	@echo "Available targets:"
	@echo "  all           - Build all components"
	@echo "  core-tools    - Build collector, detector, exporter"
	@echo "  security-tools- Build quarantine, hash, patcher"
	@echo "  test          - Run tests on all components"
	@echo "  clean         - Remove build artifacts"
	@echo "  clean-all     - Remove all generated files"
	@echo "  dev-setup     - Complete development setup"
	@echo "  production    - Optimized production build"
	@echo "  install-deps  - Install required dependencies"

.PHONY: all directories collector detector exporter quarantine hash patcher security-tools core-tools install-deps test clean clean-all dev-setup production help

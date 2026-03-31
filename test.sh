#!/bin/bash

# Simple test script for Antispyware Project

echo "Running Antispyware Tests..."

# Check if executables exist
if [ ! -f "agent/collector" ] || [ ! -f "agent/detector" ] || [ ! -f "agent/exporter" ]; then
    echo "❌ Executables not found. Run 'make all' first."
    exit 1
fi

echo "✅ Executables found"

# Test collector on agent directory
echo "Testing collector..."
./agent/collector agent/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Collector test passed"
else
    echo "❌ Collector test failed"
fi

# Test detector on agent directory
echo "Testing detector..."
./agent/detector agent/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Detector test passed"
else
    echo "❌ Detector test failed"
fi

# Test exporter
echo "Testing exporter..."
./agent/exporter agent/ /tmp/test_evidence.json > /dev/null 2>&1
if [ $? -eq 0 ] && [ -f "/tmp/test_evidence.json" ]; then
    echo "✅ Exporter test passed"
    rm -f /tmp/test_evidence.json
else
    echo "❌ Exporter test failed"
fi

# Check if logs are being written
if [ -f "logs/forensic.log" ]; then
    echo "✅ Log file exists"
else
    echo "❌ Log file missing"
fi

echo "Tests completed!"
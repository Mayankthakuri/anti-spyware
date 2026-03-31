#!/bin/bash

# Antispyware Daemon Uninstallation Script
# This script removes the launch daemon from macOS

PLIST_DEST="/Library/LaunchDaemons/com.antispyware.plist"
SCRIPT_DEST="/usr/local/bin/antispyware_daemon.sh"

echo "Uninstalling Antispyware Daemon..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./uninstall.sh)"
    exit 1
fi

# Unload the daemon
launchctl unload "$PLIST_DEST" 2>/dev/null

# Remove the plist
rm -f "$PLIST_DEST"

# Remove the script
rm -f "$SCRIPT_DEST"

echo "Daemon uninstalled successfully."
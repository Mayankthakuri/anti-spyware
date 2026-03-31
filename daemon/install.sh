#!/bin/bash

# Antispyware Daemon Installation Script
# This script installs the launch daemon on macOS

PLIST_SOURCE="/Users/mayankchand/Public/Antispyware/daemon/com.antispyware.xml"
PLIST_DEST="/Library/LaunchDaemons/com.antispyware.plist"
SCRIPT_SOURCE="/Users/mayankchand/Public/Antispyware/daemon/antispyware_daemon.sh"
SCRIPT_DEST="/usr/local/bin/antispyware_daemon.sh"

echo "Installing Antispyware Daemon..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./install.sh)"
    exit 1
fi

# Copy the plist to LaunchDaemons
cp "$PLIST_SOURCE" "$PLIST_DEST"
if [ $? -ne 0 ]; then
    echo "Failed to copy plist file"
    exit 1
fi

# Copy the script to /usr/local/bin
cp "$SCRIPT_SOURCE" "$SCRIPT_DEST"
chmod +x "$SCRIPT_DEST"
if [ $? -ne 0 ]; then
    echo "Failed to copy daemon script"
    exit 1
fi

# Update the plist to point to the installed script
sed -i '' "s|/Users/mayankchand/Public/Antispyware/daemon/antispyware_daemon.sh|/usr/local/bin/antispyware_daemon.sh|g" "$PLIST_DEST"

# Set proper permissions
chown root:wheel "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

# Load the daemon
launchctl load "$PLIST_DEST"
if [ $? -eq 0 ]; then
    echo "Daemon installed and loaded successfully!"
    echo "The antispyware daemon will run every hour and at system startup."
else
    echo "Failed to load daemon"
    exit 1
fi

echo "Installation complete."
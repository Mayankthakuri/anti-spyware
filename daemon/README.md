# Antispyware Daemon

This directory contains the launch daemon configuration for the antispyware system.

## Files

- `com.antispyware.xml`: Launch daemon plist configuration
- `antispyware_daemon.sh`: Daemon script that runs periodic scans
- `install.sh`: Installation script (run with sudo)
- `uninstall.sh`: Uninstallation script (run with sudo)

## Installation

To install the daemon system-wide:

```bash
sudo ./install.sh
```

This will:
- Copy the plist to `/Library/LaunchDaemons/`
- Copy the script to `/usr/local/bin/`
- Load the daemon with launchctl

## Usage

Once installed, the daemon will:
- Run at system startup
- Run every hour automatically
- Scan for suspicious files
- Export evidence to `../export/evidence.json`
- Log activities to `../logs/forensic.log`

## Manual Testing

You can test the daemon script manually:

```bash
./antispyware_daemon.sh
```

## Uninstallation

To remove the daemon:

```bash
sudo ./uninstall.sh
```

## Notes

- The daemon scans the project directory by default (for demo purposes)
- In production, modify the script to scan appropriate directories
- Ensure proper permissions and paths for your environment
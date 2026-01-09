# pimoni

A system monitoring script for Raspberry Pi 5 with dual NVMe HAT that collects hardware metrics and outputs them in structured JSON format (JSONL-ready).

## Features

- **CPU Monitoring**: Individual core frequencies and temperature readings
- **Storage Monitoring**: NVMe drive temperatures via SMART logs
- **Thermal Protection**: Automatic shutdown on temperature thresholds
- **Structured Output**: JSON format with values and units for easy parsing

## Requirements

- Raspberry Pi 5
- Dual NVMe HAT with two NVMe drives (`/dev/nvme0`, `/dev/nvme1`)
- `jq` for JSON processing
- `nvme-cli` for NVMe SMART data

## Installation

### Font packages
```sh
sudo apt install fonts-terminus
```

Make sure the font path matches `FONT_PATH` in `display.py`:
```sh
ls /usr/share/fonts/truetype/terminus/
```

### Python dependencies
```sh
pip install --requirement requirements.txt
```

## Usage

### Single measurement
```sh
sudo ./readings.sh
```

### Continuous monitoring
```sh
# Log measurements every 5 seconds to JSONL file
sudo ./watch.sh 5 "./readings.sh | jq --compact-output >> log.jsonl"

# Monitor with thermal protection (automatic shutdown at 75°C)
sudo ./watch.sh 5 "./readings.sh | jq --compact-output | tee --append log.jsonl | ./thermal-shutdown.sh 75"
```

### OLED display output
```sh
# Output to OLED display (128x64 SSD1306 via I2C)
sudo ./watch.sh 1 ./readings.sh | ./display.py
```

## Running as a systemd service

> [!WARNING]
> The service file `pimoni.service` has a hardcoded path `/home/rpi5/pimoni`.
> If your installation directory is different, edit the `ExecStart` line before copying it.

### Setup

1. Create a virtual environment and install dependencies:
```sh
cd /home/rpi5/pimoni
python3 -m venv venv
source venv/bin/activate
pip install --requirement requirements.txt
```

2. Copy the service file and enable it:
```sh
sudo cp pimoni.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pimoni
sudo systemctl start pimoni
```

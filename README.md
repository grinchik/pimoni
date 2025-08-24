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

### Continuous monitoring with visual file output
```sh
# Render table of last N measurements to file
sudo ./watch.sh 1 ./readings.sh | stdbuf -oL jq --compact-output | ./circular-buffer.py 10 | ./report.py report.txt
```

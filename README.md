# pimoni

System monitoring for Raspberry Pi 5 in Argon ONE V5 M.2 dual NVME case.
Displays metrics on the built-in OLED screen.

## Requirements

- Raspberry Pi 5 in Argon ONE V5 M.2 dual NVME case
- Argon ONE V5 Industria OLED Display Module
- Two NVMe drives (`/dev/nvme0`, `/dev/nvme1`)
- `nvme-cli` for NVMe SMART data
- `fonts-terminus`
- `luma.oled` python package
- `Pillow` python package

## Installation

1. Install system dependencies:
```sh
sudo apt install fonts-terminus nvme-cli
```

2. Create a virtual environment and install Python dependencies:
```sh
cd /home/rpi5/pimoni
python3 -m venv venv
source venv/bin/activate
pip install --requirement requirements.txt
```

3. Copy the systemd service file and enable it:
```sh
sudo cp pimoni.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pimoni
sudo systemctl start pimoni
```

> [!NOTE]
> The service file has a hardcoded path `/home/rpi5/pimoni`.
> Edit `pimoni.service` if your installation directory is different.

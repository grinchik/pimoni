#!/usr/bin/env python3

import sys
import json
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from dataclasses import dataclass, fields
from enum import Enum

if len(sys.argv) != 3:
    print("Usage: report.py <ip> <port>", file=sys.stderr)
    sys.exit(1)

IP = sys.argv[1]
PORT = int(sys.argv[2])

latest_line = ""

class Unit(Enum):
    SECONDS = "s"
    KHZ = "kHz"
    MILLICELSIUS = "mC"
    CELSIUS = "C"
    HERTZ = "Hz"
    KELVIN = "K"

@dataclass
class Measurement:
    value: float
    unit: Unit

@dataclass
class Reading:
    timestamp: Measurement
    cpu_core0_freq: Measurement
    cpu_core1_freq: Measurement
    cpu_core2_freq: Measurement
    cpu_core3_freq: Measurement
    cpu_temp: Measurement
    vcgencmd_temp: Measurement
    vcgencmd_arm_freq: Measurement
    nvme0_temperature: Measurement
    nvme1_temperature: Measurement

def reading_list(raw_reading_list):
    READING_LIST = []

    for raw_reading_list_item in raw_reading_list:
        READING = {}

        for key, value in raw_reading_list_item.items():
            READING[key] = Measurement(value["value"], Unit(value["unit"]))

        READING_LIST.append(Reading(**READING))

    return READING_LIST

def render(reading_list):
    LINE_LIST = []

    METRIC_LIST = [field.name for field in fields(Reading)]

    for metric in METRIC_LIST:
        row = metric.ljust(20) + " | "

        for reading in reading_list:
            value = getattr(reading, metric).value
            row += f"{value:.1f}".ljust(12) + " | "

        LINE_LIST.append(row)

    return "\n".join(LINE_LIST) + "\n"

class DashboardHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/dashboard':
            if latest_line:
                output = render(reading_list(json.loads(latest_line)))
            else:
                output = ""

            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(output.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def start_web_server():
    server = HTTPServer((IP, PORT), DashboardHandler)
    server.serve_forever()

web_thread = threading.Thread(target=start_web_server, daemon=True)
web_thread.start()

for line in sys.stdin:
    line = line.strip()
    latest_line = line

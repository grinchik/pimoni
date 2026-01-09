#!/usr/bin/env python3

import sys
import json
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from dataclasses import dataclass, fields
from enum import Enum
from typing import assert_never, TypedDict

if len(sys.argv) != 3:
    print("Usage: report.py <ip> <port>", file=sys.stderr)
    sys.exit(1)

IP = sys.argv[1]
PORT = int(sys.argv[2])

latest_line = ""

class RawMeasurement(TypedDict):
    value: float
    unit: str

class Unit(Enum):
    SECONDS = "s"
    KHZ = "kHz"
    MILLICELSIUS = "mC"
    CELSIUS = "C"
    HERTZ = "Hz"
    KELVIN = "K"
    RPM = "RPM"

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
    fan_rpm: Measurement

def reading(raw_reading: dict[str, RawMeasurement]) -> Reading:
    READING: dict[str, Measurement] = {}

    for key, value in raw_reading.items():
        READING[key] = Measurement(
            float(value["value"]),
            Unit(value["unit"])
        )

    return Reading(**READING)

def convert_to_human_readable(measurement: Measurement) -> tuple[float, str]:
    """Convert measurement to human-readable format"""
    match measurement.unit:
        case Unit.KELVIN:
            return measurement.value - 273.15, "C"
        case Unit.HERTZ:
            return measurement.value / 1_000_000_000, "GHz"
        case Unit.KHZ:
            return measurement.value / 1_000_000, "GHz"
        case Unit.MILLICELSIUS:
            return measurement.value / 1000, "C"
        case Unit.CELSIUS:
            return measurement.value, "C"
        case Unit.SECONDS:
            return measurement.value, "s"
        case Unit.RPM:
            return measurement.value, "RPM"
        case _ as unreachable:
            assert_never(unreachable)

def render(reading: Reading) -> str:
    LINE_LIST: list[str] = []

    METRIC_LIST = [field.name for field in fields(Reading)]
    MAX_METRIC_LEN = max(len(metric) for metric in METRIC_LIST)

    for metric in METRIC_LIST:
        measurement = getattr(reading, metric)
        value, unit = convert_to_human_readable(measurement)

        if metric == "timestamp" or metric == "fan_rpm":
            row = f"{metric.ljust(MAX_METRIC_LEN)} | {value:.0f} {unit}"
        else:
            row = f"{metric.ljust(MAX_METRIC_LEN)} | {value:.2f} {unit}"

        LINE_LIST.append(row)

    return "\n".join(LINE_LIST) + "\n"

class DashboardHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/dashboard':
            if latest_line:
                output = render(reading(json.loads(latest_line)))
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

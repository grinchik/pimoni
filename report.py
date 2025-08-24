#!/usr/bin/env python3

import sys
import json
from dataclasses import dataclass, fields
from enum import Enum

if len(sys.argv) != 2:
    print("Usage: report.py <output_file>", file=sys.stderr)
    sys.exit(1)

OUTPUT_FILE = sys.argv[1]

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

    return "\n".join(LINE_LIST)

def save_to_file(file_name, file_content):
    with open(file_name, 'w') as f:
        f.write(file_content)

for line in sys.stdin:
    line = line.strip()

    RAW_READING_LIST = json.loads(line)
    READING_LIST = reading_list(RAW_READING_LIST)
    OUTPUT = render(READING_LIST)
    save_to_file(OUTPUT_FILE, OUTPUT)

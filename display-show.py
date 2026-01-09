#!/usr/bin/env python3

import sys
import json
from dataclasses import dataclass
from enum import Enum
from typing import assert_never, TypedDict

from luma.core.interface.serial import i2c
from luma.oled.device import ssd1306
from PIL import Image, ImageDraw, ImageFont

DISPLAY_WIDTH = 128
DISPLAY_HEIGHT = 64

serial = i2c(port=1, address=0x3c)
device = ssd1306(serial, width=DISPLAY_WIDTH, height=DISPLAY_HEIGHT)
device.contrast(0)

FONT_PATH = "/usr/share/fonts/truetype/terminus/TerminusTTF-4.46.0.ttf"
FONT_SIZE = 16
font = ImageFont.truetype(FONT_PATH, FONT_SIZE)

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

def format_display(r: Reading) -> list[str]:
    cpu0, _ = convert_to_human_readable(r.cpu_core0_freq)
    cpu1, _ = convert_to_human_readable(r.cpu_core1_freq)
    cpu2, _ = convert_to_human_readable(r.cpu_core2_freq)
    cpu3, _ = convert_to_human_readable(r.cpu_core3_freq)
    cpu_max_ghz = max(cpu0, cpu1, cpu2, cpu3)

    cpu_temp, _ = convert_to_human_readable(r.cpu_temp)
    vcgencmd_temp, _ = convert_to_human_readable(r.vcgencmd_temp)

    nvme0, _ = convert_to_human_readable(r.nvme0_temperature)
    nvme1, _ = convert_to_human_readable(r.nvme1_temperature)

    fan_rpm, _ = convert_to_human_readable(r.fan_rpm)

    line1 = f"CPU GHz:    {cpu_max_ghz:.2f}"
    line2 = f"CPU  °C: {round(cpu_temp)} | {round(vcgencmd_temp)}"
    line3 = f"NVME °C: {round(nvme0)} | {round(nvme1)}"
    line4 = f"FAN RPM:{int(fan_rpm):>8}"

    return [line1, line2, line3, line4]

def display_lines(lines: list[str]):
    LINE_HEIGHT = FONT_SIZE

    img = Image.new("1", (DISPLAY_WIDTH, DISPLAY_HEIGHT), 0)
    draw = ImageDraw.Draw(img)

    for i, line in enumerate(lines):
        draw.text((0, i * LINE_HEIGHT), line, font=font, fill=1)

    device.display(img)

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    r = reading(json.loads(line))
    lines = format_display(r)
    display_lines(lines)

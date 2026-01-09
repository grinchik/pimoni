#!/usr/bin/env python3

from luma.core.interface.serial import i2c
from luma.oled.device import ssd1306

DISPLAY_WIDTH = 128
DISPLAY_HEIGHT = 64

serial = i2c(port=1, address=0x3c)
device = ssd1306(serial, width=DISPLAY_WIDTH, height=DISPLAY_HEIGHT)
device.hide()

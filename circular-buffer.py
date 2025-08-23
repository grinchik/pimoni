#!/usr/bin/env python3

import sys
from collections import deque

if len(sys.argv) != 2:
    print("Usage: circular-buffer.py <BUFFER_SIZE>", file=sys.stderr)
    sys.exit(1)

BUFFER_SIZE = int(sys.argv[1])
BUFFER = deque(maxlen=BUFFER_SIZE)

for line in sys.stdin:
    line = line.rstrip('\n')

    BUFFER.append(line)

    for item in BUFFER:
        print(item)

    sys.stdout.flush()

#!/usr/bin/env python3

import sys
import json
from collections import deque

if len(sys.argv) != 2:
    print("Usage: circular-buffer.py <BUFFER_SIZE>", file=sys.stderr)
    sys.exit(1)

BUFFER_SIZE = int(sys.argv[1])
BUFFER = deque(maxlen=BUFFER_SIZE)

for line in sys.stdin:
    line = line.rstrip('\n')

    BUFFER.append(line)

    BUFFER_LIST = []

    for item in BUFFER:
        try:
            PARSED_ITEM = json.loads(item)
        except json.JSONDecodeError:
            continue

        BUFFER_LIST.append(PARSED_ITEM)

    print(json.dumps(BUFFER_LIST))
    sys.stdout.flush()

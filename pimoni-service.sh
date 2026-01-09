#!/bin/bash
set -e;

cd "$(dirname "$0")";

source venv/bin/activate;

./watch.sh \
    1 \
    ./readings.sh \
| \
    tee \
        >(python ./report.py 0.0.0.0 3100) \
    | \
        python ./display.py \
    \
&& \
true;

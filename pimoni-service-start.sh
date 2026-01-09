#!/bin/bash
set -e;

cd "$(dirname "$0")";

source venv/bin/activate;

./watch.sh \
    1 \
    ./readings.sh \
| \
python ./display-show.py \
&& \
true;

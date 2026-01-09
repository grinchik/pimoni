#!/bin/bash
set -e

cd "$(dirname "$0")";

source venv/bin/activate;

python ./display-hide.py \
&& \
true;

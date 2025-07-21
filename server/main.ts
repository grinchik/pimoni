import { Interface } from 'readline';
import { CircularBuffer } from './CircularBuffer.ts';
import type { Line } from './Line.ts';

export function main (
    lineCircularBuffer: CircularBuffer<Line>,
    rl: Interface,
) {
    rl.on('line', (line: Line) => lineCircularBuffer.push(line));
};

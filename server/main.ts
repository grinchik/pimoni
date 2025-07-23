import { Interface } from 'readline';
import { Server, ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import { requestHandler } from './requestHandler.ts';
import { broadcastLine } from './broadcastLine.ts';
import type { Line } from './Line.ts';

export function main (
    lineCircularBuffer: CircularBuffer<Line>,
    rl: Interface,
    server: Server,
    clientSet: Set <ServerResponse>,
) {
    lineCircularBuffer.on('push', broadcastLine.bind(null, clientSet));
    rl.on('line', (line: Line) => lineCircularBuffer.push(line));
    server.on('request', requestHandler(lineCircularBuffer, clientSet));
};

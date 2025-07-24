import { Interface } from 'readline';
import { Server } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import { requestHandler } from './requestHandler.ts';
import { broadcastLine } from './broadcastLine.ts';
import { sendInitialLines } from './sendInitialLines.ts';
import { ClientSet } from './ClientSet.ts';
import type { Line } from './Line.ts';

export function main (
    lineCircularBuffer: CircularBuffer<Line>,
    rl: Interface,
    server: Server,
    clientSet: ClientSet,
) {
    lineCircularBuffer.on('push', broadcastLine.bind(null, clientSet));
    clientSet.on('client-added', sendInitialLines.bind(null, lineCircularBuffer));
    rl.on('line', (line: Line) => lineCircularBuffer.push(line));
    server.on('request', requestHandler(clientSet));
};

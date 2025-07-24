import { ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import type { Line } from './Line.ts';

export function sendInitialLines (
    lineCircularBuffer: CircularBuffer<Line>,
    client: ServerResponse,
): void {
    const lines = lineCircularBuffer.toArray();

    // TODO: catch throws or false return from write
    // TODO: check res.destroyed to avoid writing to zombie connections
    for (const line of lines) {
        client.write(`data: ${line}\n\n`);
    }
}

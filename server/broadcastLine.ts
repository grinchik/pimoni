import { ServerResponse } from 'http';
import type { Line } from './Line.ts';

export function broadcastLine (
    clientSet: Set <ServerResponse>,
    line: Line,
): void {
    for (const client of clientSet) {
        // TODO: handle destroyed clients and write errors
        client.write(`data: ${line}\n\n`);
    }
}

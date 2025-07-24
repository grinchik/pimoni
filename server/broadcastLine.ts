import { ServerResponse } from 'http';
import { ClientSet } from './ClientSet.ts';
import type { Line } from './Line.ts';

export function broadcastLine (
    clientSet: ClientSet,
    line: Line,
): void {
    for (const client of clientSet.clientSet) {
        // TODO: handle destroyed clients and write errors
        client.write(`data: ${line}\n\n`);
    }
}

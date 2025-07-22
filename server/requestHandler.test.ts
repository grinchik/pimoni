import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { IncomingMessage, ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import { requestHandler } from './requestHandler.ts';

describe('requestHandler', () => {
    test('returns handler function', () => {
        const buffer = new CircularBuffer<string>(3);
        const clientSet = new Set<ServerResponse>();
        const handler = requestHandler(buffer, clientSet);
        assert.equal(typeof handler, 'function');
    });

    test('handler function accepts req and res parameters', () => {
        const buffer = new CircularBuffer<string>(3);
        const clientSet = new Set<ServerResponse>();
        const handler = requestHandler(buffer, clientSet);
        assert.equal(handler.length, 2);
    });

    test('handler calls writeHead and write methods for SSE, keeps connection alive', () => {
        const buffer = new CircularBuffer<string>(3);
        buffer.push('line1');
        buffer.push('line2');

        const clientSet = new Set<ServerResponse>();
        const handler = requestHandler(buffer, clientSet);

        let writeHeadCalled = false;
        let endCalled = false;
        let statusCode = 0;
        let headers: Record <string, string> = {};
        let writeData: string[] = [];

        const mockRes = {
            writeHead: (code: number, hdrs: Record <string, string>) => {
                writeHeadCalled = true;
                statusCode = code;
                headers = hdrs;
            },
            write: (data: string) => {
                writeData.push(data);
            },
            end: () => {
                endCalled = true;
            },
            on: () => {}
        };

        handler({} as IncomingMessage, mockRes as unknown as ServerResponse);

        assert.equal(writeHeadCalled, true);
        assert.equal(endCalled, false);
        assert.equal(statusCode, 200);
        assert.equal(headers['Content-Type'], 'text/event-stream');
        assert.equal(headers['Cache-Control'], 'no-cache');
        assert.equal(writeData.length, 2);
        assert.equal(writeData[0], 'data: line1\n\n');
        assert.equal(writeData[1], 'data: line2\n\n');
    });
});

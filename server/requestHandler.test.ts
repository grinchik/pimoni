import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { IncomingMessage, ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import { requestHandler } from './requestHandler.ts';

describe('requestHandler', () => {
    test('returns handler function', () => {
        const buffer = new CircularBuffer<string>(3);
        const handler = requestHandler(buffer);
        assert.equal(typeof handler, 'function');
    });

    test('handler function accepts req and res parameters', () => {
        const buffer = new CircularBuffer<string>(3);
        const handler = requestHandler(buffer);
        assert.equal(handler.length, 2);
    });

    test('handler calls writeHead and end methods', () => {
        const buffer = new CircularBuffer<string>(2);
        buffer.push('test');

        const handler = requestHandler(buffer);

        let writeHeadCalled = false;
        let endCalled = false;
        let statusCode = 0;
        let headers: Record <string, string> = {};
        let responseData = '';

        const mockRes = {
            writeHead: (code: number, hdrs: Record <string, string>) => {
                writeHeadCalled = true;
                statusCode = code;
                headers = hdrs;
            },
            end: (data: string) => {
                endCalled = true;
                responseData = data;
            }
        };

        handler({} as IncomingMessage, mockRes as ServerResponse);

        assert.equal(writeHeadCalled, true);
        assert.equal(endCalled, true);
        assert.equal(statusCode, 200);
        assert.equal(headers['Content-Type'], 'application/json');
        assert.equal(responseData, JSON.stringify(['test']));
    });
});

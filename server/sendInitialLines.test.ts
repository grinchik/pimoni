import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import { sendInitialLines } from './sendInitialLines.ts';

describe('sendInitialLines', () => {
    test('sends all lines from buffer to client', () => {
        const buffer = new CircularBuffer<string>(3);
        buffer.push('line1');
        buffer.push('line2');
        buffer.push('line3');

        let writeData: string[] = [];
        const mockClient = {
            write: (data: string) => {
                writeData.push(data);
            }
        } as unknown as ServerResponse;

        sendInitialLines(buffer, mockClient);

        assert.equal(writeData.length, 3);
        assert.equal(writeData[0], 'data: line1\n\n');
        assert.equal(writeData[1], 'data: line2\n\n');
        assert.equal(writeData[2], 'data: line3\n\n');
    });

    test('sends empty buffer without error', () => {
        const buffer = new CircularBuffer<string>(3);

        let writeData: string[] = [];
        const mockClient = {
        } as unknown as ServerResponse;

        sendInitialLines(buffer, mockClient);

        assert.equal(writeData.length, 0);
    });

    test('handles buffer overflow correctly', () => {
        const buffer = new CircularBuffer<string>(2);
        buffer.push('line1');
        buffer.push('line2');
        buffer.push('line3'); // This overwrites line1

        let writeData: string[] = [];
        const mockClient = {
            write: (data: string) => {
                writeData.push(data);
            }
        } as unknown as ServerResponse;

        sendInitialLines(buffer, mockClient);

        assert.equal(writeData.length, 2);
        assert.equal(writeData[0], 'data: line2\n\n');
        assert.equal(writeData[1], 'data: line3\n\n');
    });
});

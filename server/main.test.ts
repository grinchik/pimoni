import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { Readable } from 'node:stream';
import { createInterface } from 'readline';
import { CircularBuffer } from './CircularBuffer.ts';
import { main } from './main.ts';

class MockInputStream extends Readable {
    _read() {}

    writeLine(line: string) {
        this.push(line + '\n');
    }
}

describe('main', () => {
    test('sets up line event listener on readline interface', () => {
        const buffer = new CircularBuffer<string>(3);
        const mockInputStream = new MockInputStream();
        const rl = createInterface({
            input: mockInputStream,
            terminal: false,
        });

        main(buffer, rl);

        assert.equal(rl.listenerCount('line'), 1);

        rl.close();
    });

    test('adds lines to circular buffer when line events are emitted', async () => {
        const buffer = new CircularBuffer<string>(3);
        const mockInputStream = new MockInputStream();
        const rl = createInterface({
            input: mockInputStream,
            terminal: false,
        });

        main(buffer, rl);

        const p1 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('first line');
        await p1;

        const p2 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('second line');
        await p2;

        assert.deepEqual(buffer.toArray(), ['first line', 'second line']);

        rl.close();
    });

    test('handles buffer overflow correctly', async () => {
        const buffer = new CircularBuffer<string>(2);
        const mockInputStream = new MockInputStream();
        const rl = createInterface({
            input: mockInputStream,
            terminal: false,
        });

        main(buffer, rl);

        const p1 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('line 1');
        await p1;

        const p2 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('line 2');
        await p2;

        const p3 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('line 3');
        await p3;

        assert.deepEqual(buffer.toArray(), ['line 2', 'line 3']);

        rl.close();
    });

    test('handles empty lines', async () => {
        const buffer = new CircularBuffer<string>(3);
        const mockInputStream = new MockInputStream();
        const rl = createInterface({
            input: mockInputStream,
            terminal: false,
        });

        main(buffer, rl);

        const p1 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('');
        await p1;

        const p2 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('non-empty');
        await p2;

        const p3 = new Promise(resolve => rl.once('line', resolve));
        mockInputStream.writeLine('');
        await p3;

        assert.deepEqual(buffer.toArray(), ['', 'non-empty', '']);

        rl.close();
    });
});

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { CircularBuffer } from './CircularBuffer.ts';

describe('CircularBuffer', () => {
    test('constructor throws error for invalid capacity', () => {
        assert.throws(
            () => new CircularBuffer<number>(0),
            { message: CircularBuffer.ERR_INVALID_CAPACITY },
        );
        assert.throws(
            () => new CircularBuffer<number>(-1),
            { message: CircularBuffer.ERR_INVALID_CAPACITY },
        );
    });

    test('push adds items to buffer', () => {
        const buffer = new CircularBuffer<number>(3);
        buffer.push(1);
        buffer.push(2);
        
        assert.deepEqual(buffer.toArray(), [1, 2]);
    });

    test('push overwrites old items when buffer is full', () => {
        const buffer = new CircularBuffer<number>(3);
        buffer.push(1);
        buffer.push(2);
        buffer.push(3);
        buffer.push(4);
        
        assert.deepEqual(buffer.toArray(), [2, 3, 4]);
    });

    test('toArray returns empty array when buffer is empty', () => {
        const buffer = new CircularBuffer<number>(3);
        assert.deepEqual(buffer.toArray(), []);
    });

    test('maintains correct order with continuous pushing', () => {
        const buffer = new CircularBuffer<number>(3);
        
        buffer.push(1);
        assert.deepEqual(buffer.toArray(), [1]);
        
        buffer.push(2);
        assert.deepEqual(buffer.toArray(), [1, 2]);
        
        buffer.push(3);
        assert.deepEqual(buffer.toArray(), [1, 2, 3]);
        
        buffer.push(4);
        assert.deepEqual(buffer.toArray(), [2, 3, 4]);
        
        buffer.push(5);
        assert.deepEqual(buffer.toArray(), [3, 4, 5]);
    });

    test('works with string type', () => {
        const buffer = new CircularBuffer<string>(2);
        buffer.push('hello');
        buffer.push('world');
        buffer.push('!');
        assert.deepEqual(buffer.toArray(), ['world', '!']);
    });

    describe('CircularBuffer with capacity 1', () => {
        test('should initialize empty with capacity 1', () => {
            const buffer = new CircularBuffer<number>(1);
            assert.deepEqual(buffer.toArray(), []);
        });

        test('should store single item when capacity is 1', () => {
            const buffer = new CircularBuffer<number>(1);
            buffer.push(42);
            assert.deepEqual(buffer.toArray(), [42]);
        });

        test('should overwrite items when capacity is 1', () => {
            const buffer = new CircularBuffer<number>(1);
            buffer.push(1);
            buffer.push(2);
            buffer.push(3);
            assert.deepEqual(buffer.toArray(), [3]);
            
            const stringBuffer = new CircularBuffer<string>(1);
            stringBuffer.push('first');
            stringBuffer.push('second');
            assert.deepEqual(stringBuffer.toArray(), ['second']);
        });
    });
});

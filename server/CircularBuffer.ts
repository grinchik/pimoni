export class CircularBuffer <T> {
    private buffer: T[];
    private head: number = 0;
    private size: number = 0;
    private readonly capacity: number;

    constructor (capacity: number) {
        if (capacity <= 0) {
            throw new Error(CircularBuffer.ERR_INVALID_CAPACITY);
        }

        this.capacity = capacity;
        this.buffer = new Array(capacity);
    }

    public push (item: T): void {
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.capacity;

        if (this.size < this.capacity) {
            this.size++;
        }
    }

    public toArray (): T[] {
        const result: T[] = [];
        const start = this.size < this.capacity ? 0 : this.head;

        for (let i = 0; i < this.size; i++) {
            result.push(this.buffer[(start + i) % this.capacity]);
        }
        return result;
    }

    public static ERR_INVALID_CAPACITY = 'ERR_INVALID_CAPACITY';
}

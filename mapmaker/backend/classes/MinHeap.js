class MinHeap {
    constructor(compareFn) {
        this.data = [];
        this.compare = compareFn;
    }

    insert(item) {
        this.data.push(item);
        this.bubbleUp();
    }

    extractMin() {
        const min = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown();
        }
        return min;
    }

    find(predicate) {
        return this.data.find(predicate);
    }

    isEmpty() {
        return this.data.length === 0;
    }

    bubbleUp() {
        let index = this.data.length - 1;
        const item = this.data[index];

        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.data[parentIndex];
            if (this.compare(item, parent) >= 0) break;

            this.data[index] = parent;
            index = parentIndex;
        }
        this.data[index] = item;
    }

    bubbleDown() {
        let index = 0;
        const length = this.data.length;
        const item = this.data[index];

        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === index) break;

            this.data[index] = this.data[smallest];
            index = smallest;
        }
        this.data[index] = item;
    }
}




module.exports = {
    MinHeap
  };
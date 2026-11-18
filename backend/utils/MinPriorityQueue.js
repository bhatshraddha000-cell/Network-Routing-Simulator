/**
 * MinPriorityQueue.js
 * 
 * Reusable Binary Min-Heap implementation for Dijkstra's Shortest Path Algorithm.
 * 
 * Each element is an object: { nodeId: string, distance: number }
 * Priority is determined strictly by element.distance (smallest distance has highest priority).
 * 
 * Asymptotic Complexities:
 * - insert(element): O(log V)
 * - extractMin():    O(log V)
 * - peek():          O(1)
 * - isEmpty():       O(1)
 * - size():          O(1)
 * 
 * Space Complexity:  O(V) where V is the number of vertices.
 */

export class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  /**
   * Returns index of parent node
   */
  #getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  /**
   * Returns index of left child
   */
  #getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  /**
   * Returns index of right child
   */
  #getRightChildIndex(index) {
    return 2 * index + 2;
  }

  /**
   * Swaps elements at index i and j
   */
  #swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Restores heap invariant upward from the given index
   */
  #bubbleUp(index) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = this.#getParentIndex(currentIndex);
      if (this.heap[currentIndex].distance < this.heap[parentIndex].distance) {
        this.#swap(currentIndex, parentIndex);
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Restores heap invariant downward from the given index
   */
  #bubbleDown(index) {
    let currentIndex = index;
    const length = this.heap.length;

    while (true) {
      let smallestIndex = currentIndex;
      const leftChildIndex = this.#getLeftChildIndex(currentIndex);
      const rightChildIndex = this.#getRightChildIndex(currentIndex);

      if (
        leftChildIndex < length &&
        this.heap[leftChildIndex].distance < this.heap[smallestIndex].distance
      ) {
        smallestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < length &&
        this.heap[rightChildIndex].distance < this.heap[smallestIndex].distance
      ) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex !== currentIndex) {
        this.#swap(currentIndex, smallestIndex);
        currentIndex = smallestIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Inserts an element into the binary min-heap
   * Complexity: O(log V)
   */
  insert(element) {
    if (
      !element ||
      element.nodeId === undefined ||
      element.distance === undefined ||
      typeof element.distance !== 'number' ||
      isNaN(element.distance)
    ) {
      throw new Error('Invalid element inserted into MinPriorityQueue. Must contain nodeId and numeric distance.');
    }

    this.heap.push(element);
    this.#bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the element with minimum distance
   * Complexity: O(log V)
   */
  extractMin() {
    if (this.isEmpty()) {
      return null;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const minElement = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.#bubbleDown(0);

    return minElement;
  }

  /**
   * Inspects the element with minimum distance without removing it
   * Complexity: O(1)
   */
  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  /**
   * Returns true if queue has no elements
   * Complexity: O(1)
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Returns the count of elements currently in the heap
   * Complexity: O(1)
   */
  size() {
    return this.heap.length;
  }

  /**
   * Clears all elements from the queue
   */
  clear() {
    this.heap = [];
  }

  /**
   * Returns an array snapshot of all elements in the priority queue,
   * sorted in priority order (lowest distance first).
   */
  getSnapshot() {
    return [...this.heap]
      .sort((a, b) => a.distance - b.distance)
      .map((item) => ({ nodeId: item.nodeId, distance: item.distance }));
  }
}

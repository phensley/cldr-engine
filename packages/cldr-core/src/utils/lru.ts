
const DEFAULT_CAPACITY = 100;

export type Node<K, V> = { key: K, val: V, next?: Node<K, V>, prev?: Node<K, V> };

/**
 * Cache evicts the least-recently-used key when capacity is exceeded.
 */
export class LRU<K, V> {

  private readonly storage: Map<K, Node<K, V>> = new Map();
  private readonly root: Node<K, V>;
  private readonly capacity: number;

  constructor(capacity: number = DEFAULT_CAPACITY) {
    this.capacity = capacity;
    const root = { } as Node<K, V>;
    root.next = root;
    root.prev = root;
    this.root = root;
  }

  get(key: K): V | undefined {
    const n = this.storage.get(key);
    if (n === undefined) {
      return n;
    }
    this.moveFront(n);
    return n.val;
  }

  set(key: K, val: V): void {
    let n = this.storage.get(key);
    if (n === undefined) {
      n = { key, val };
      this.storage.set(key, n);
    } else {
      n.val = val;
    }
    this.moveFront(n);
    if (this.storage.size > this.capacity) {
      const oldest = this.root.prev;
      if (oldest) {
        this.storage.delete(oldest.key);
        this.remove(oldest);
      }
    }
  }

  toString(): string {
    let res = '';
    let n = this.root.next;
    while (n && n !== this.root) {
      if (res.length > 0) {
        res += ' ';
      }
      res += `${n.key}=${n.val}`;
      n = n.next;
    }
    return res;
  }

  protected moveFront(n: Node<K, V>): void {
    this.insert(this.remove(n), this.root);
  }

  protected insert(e: Node<K, V>, at: Node<K, V>): Node<K, V> {
    const n = at.next;
    at.next = e;
    e.prev = at;
    e.next = n;
    if (n) {
      n.prev = e;
    }
    return e;
  }

  protected remove(n: Node<K, V>): Node<K, V> {
    if (n.prev) {
      n.prev.next = n.next;
    }
    if (n.next) {
      n.next.prev = n.prev;
    }
    n.prev = undefined;
    n.next = undefined;
    return n;
  }

}


const DEFAULT_CAPACITY = 100;

export type Key = string | number;

// Note next / prev will always be set internally, but are undefined
// temporarily when inserting a new node into the list.
type Node<V> = { key: Key, val: V, next?: Node<V>, prev?: Node<V> };

/**
 * Cache evicts the least-recently-used key when capacity is exceeded.
 */
export class LRU<V> {

  private readonly storage: Map<Key, Node<V>> = new Map();
  private readonly root: Node<V>;
  private readonly capacity: number;

  constructor(capacity: number = DEFAULT_CAPACITY) {
    this.capacity = capacity;
    const root = { } as Node<V>;
    root.next = root;
    root.prev = root;
    this.root = root;
  }

  size(): number {
    return this.storage.size;
  }

  get(key: Key): V | undefined {
    const n = this.storage.get(key);
    if (!n) {
      return undefined;
    }
    this.moveFront(n);
    return n.val;
  }

  set(key: Key, val: V): void {
    if (this.capacity === 0) {
      return;
    }

    let n = this.storage.get(key);

    // Key already exists, so replace its value and bump it
    // to the front. Size does not change.
    if (n) {
      n.val = val;
      this.moveFront(n);
      return;
    }

    // The lru is full, so reuse the oldest node to keep the
    // total node allocation stable.
    if (this.storage.size === this.capacity) {
      const old = this.root.prev!;
      this.storage.delete(old.key);
      this.storage.set(key, old);
      old.key = key;
      old.val = val;
      this.moveFront(old);
      return;
    }

    // The lru is not full, so allocate a new node.
    n = { key, val };
    this.storage.set(key, n);
    this.insert(n, this.root);
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

  protected moveFront(n: Node<V>): void {
    this.insert(this.remove(n), this.root);
  }

  protected insert(e: Node<V>, at: Node<V>): Node<V> {
    const n = at.next;
    at.next = e;
    e.prev = at;
    e.next = n;
    n!.prev = e;
    return e;
  }

  protected remove(n: Node<V>): Node<V> {
    n.prev!.next = n.next;
    n.next!.prev = n.prev;
    n.prev = n.next = undefined;
    return n;
  }

}

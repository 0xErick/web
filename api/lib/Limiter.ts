import assert from "assert";

export default class Limiter {
  id: string;
  db: any;
  max: string;
  duration: number;
  key: string;
  constructor({ id, db, max, duration, namespace = "limit" }: any) {
    this.id = id;
    assert(this.id, ".id required");
    this.db = db || new Map();
    assert(
      this.db instanceof Map,
      "for memory driver, .db must be Map instance"
    );
    this.max = max;
    this.duration = duration;
    this.key = `${namespace}:${this.id}`;
  }

  async get() {
    const { id, db, duration, key, max } = this;

    const entry = this.db.get(key);
    const now = Date.now();

    const reset = now + duration;
    const expired = entry !== undefined && entry.reset * 1e3 < now;
    const hasKey = db.has(key);
    const shouldReInit = !hasKey || expired;

    if (shouldReInit) {
      const initState = {
        id,
        reset: Math.floor(reset / 1e3),
        remaining: max,
        total: max,
      };
      db.set(key, initState);

      return initState;
    } else {
      entry.remaining = entry.remaining > 0 ? entry.remaining - 1 : 0;

      return entry;
    }
  }
}

const buckets = new Map();
const WINDOW = 60_000; // 1 minute

export function rateLimit(key, limit = 20) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, start: now };
  if (now - bucket.start > WINDOW) {
    bucket.count = 0;
    bucket.start = now;
  }
  bucket.count++;
  buckets.set(key, bucket);
  return bucket.count <= limit;
}

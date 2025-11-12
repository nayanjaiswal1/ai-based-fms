/**
 * Cache Utilities
 * Helpers for managing browser cache and storage
 */

// Cache version - increment to invalidate all caches
const CACHE_VERSION = 'v1';
const CACHE_PREFIX = 'fms-cache';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Set item in cache with expiration
 */
export function setCacheItem<T>(
  key: string,
  data: T,
  storage: Storage = localStorage,
): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    storage.setItem(`${CACHE_PREFIX}:${key}`, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to set cache item:', error);
    // Handle quota exceeded errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldestCacheItems(storage);
    }
  }
}

/**
 * Get item from cache
 */
export function getCacheItem<T>(
  key: string,
  maxAge?: number,
  storage: Storage = localStorage,
): T | null {
  try {
    const item = storage.getItem(`${CACHE_PREFIX}:${key}`);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);

    // Check version
    if (entry.version !== CACHE_VERSION) {
      storage.removeItem(`${CACHE_PREFIX}:${key}`);
      return null;
    }

    // Check age
    if (maxAge && Date.now() - entry.timestamp > maxAge) {
      storage.removeItem(`${CACHE_PREFIX}:${key}`);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Failed to get cache item:', error);
    return null;
  }
}

/**
 * Remove item from cache
 */
export function removeCacheItem(
  key: string,
  storage: Storage = localStorage,
): void {
  try {
    storage.removeItem(`${CACHE_PREFIX}:${key}`);
  } catch (error) {
    console.error('Failed to remove cache item:', error);
  }
}

/**
 * Clear all cache items
 */
export function clearCache(storage: Storage = localStorage): void {
  try {
    const keys = Object.keys(storage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        storage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get cache size in bytes
 */
export function getCacheSize(storage: Storage = localStorage): number {
  let size = 0;
  try {
    const keys = Object.keys(storage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        const item = storage.getItem(key);
        if (item) {
          size += item.length + key.length;
        }
      }
    });
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
  }
  return size;
}

/**
 * Clear oldest cache items when quota exceeded
 */
function clearOldestCacheItems(storage: Storage = localStorage): void {
  try {
    const items: Array<{ key: string; timestamp: number }> = [];

    const keys = Object.keys(storage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        const item = storage.getItem(key);
        if (item) {
          try {
            const entry: CacheEntry<unknown> = JSON.parse(item);
            items.push({ key, timestamp: entry.timestamp });
          } catch {
            // Invalid entry, remove it
            storage.removeItem(key);
          }
        }
      }
    });

    // Sort by timestamp and remove oldest 25%
    items.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(items.length * 0.25);

    for (let i = 0; i < toRemove; i++) {
      storage.removeItem(items[i].key);
    }
  } catch (error) {
    console.error('Failed to clear oldest cache items:', error);
  }
}

/**
 * IndexedDB wrapper for larger data
 */
export class IndexedDBCache {
  private dbName = 'fms-cache-db';
  private storeName = 'cache';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, {
            keyPath: 'key',
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async set<T>(key: string, data: T): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);

      const entry: CacheEntry<T> & { key: string } = {
        key,
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };

      const request = objectStore.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(key: string, maxAge?: number): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as (CacheEntry<T> & { key: string }) | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check version
        if (entry.version !== CACHE_VERSION) {
          this.remove(key);
          resolve(null);
          return;
        }

        // Check age
        if (maxAge && Date.now() - entry.timestamp > maxAge) {
          this.remove(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
    });
  }

  async remove(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Singleton instance
export const indexedDBCache = new IndexedDBCache();

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onNetworkChange(
  callback: (isOnline: boolean) => void,
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Format cache size for display
 */
export function formatCacheSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

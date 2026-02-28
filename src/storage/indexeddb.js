/**
 * IndexedDB Initialization Module
 * 
 * Handles database connection and schema creation.
 */

const DB_NAME = 'task-manager-db';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

/**
 * Initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Create indexes for querying
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('dueDate', 'dueDate', { unique: false });
        store.createIndex('completed', 'completed', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Get a database connection (singleton pattern)
 * @type {IDBDatabase|null}
 */
let dbInstance = null;

/**
 * Get or create database connection
 * @returns {Promise<IDBDatabase>}
 */
export async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await initDB();
  return dbInstance;
}

/**
 * Close the database connection
 */
export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

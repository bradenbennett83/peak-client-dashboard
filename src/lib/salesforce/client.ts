import jsforce from "jsforce";

// Define our own simplified types since @types/jsforce has issues
interface SalesforceRecord {
  Id: string;
  [key: string]: unknown;
}

interface RecordResult {
  id: string;
  success: boolean;
  errors?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Connection = any;

export interface QueryResult<T> {
  totalSize: number;
  done: boolean;
  records: T[];
}

let connection: Connection | null = null;
let connectionPromise: Promise<Connection> | null = null;

/**
 * Get a Salesforce connection using username/password auth
 * Uses singleton pattern to reuse connections
 */
export async function getSalesforceConnection(): Promise<Connection> {
  // Return existing connection if valid
  if (connection) {
    return connection;
  }

  // Return pending connection promise to avoid duplicate logins
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = createConnection();
  connection = await connectionPromise;
  connectionPromise = null;

  return connection;
}

async function createConnection(): Promise<Connection> {
  const conn = new jsforce.Connection({
    loginUrl: process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com",
  });

  const username = process.env.SALESFORCE_USERNAME;
  const password = process.env.SALESFORCE_PASSWORD;
  const securityToken = process.env.SALESFORCE_SECURITY_TOKEN || "";

  if (!username || !password) {
    throw new Error("Salesforce credentials not configured");
  }

  await conn.login(username, password + securityToken);

  return conn;
}

/**
 * Reset the connection (useful when token expires)
 */
export function resetConnection(): void {
  connection = null;
  connectionPromise = null;
}

/**
 * Execute a SOQL query with automatic reconnection on auth failure
 */
export async function query<T>(soql: string): Promise<QueryResult<T>> {
  try {
    const conn = await getSalesforceConnection();
    return (await conn.query(soql)) as QueryResult<T>;
  } catch (error) {
    // If auth error, reset connection and retry once
    if (
      error instanceof Error &&
      (error.message.includes("INVALID_SESSION_ID") ||
        error.message.includes("Session expired"))
    ) {
      resetConnection();
      const conn = await getSalesforceConnection();
      return (await conn.query(soql)) as QueryResult<T>;
    }
    throw error;
  }
}

/**
 * Retrieve a single record by ID
 */
export async function retrieve(
  objectType: string,
  id: string
): Promise<SalesforceRecord> {
  const conn = await getSalesforceConnection();
  return await conn.sobject(objectType).retrieve(id) as SalesforceRecord;
}

/**
 * Update a record
 */
export async function update(
  objectType: string,
  record: object
): Promise<RecordResult> {
  const conn = await getSalesforceConnection();
  return await conn.sobject(objectType).update(record);
}

/**
 * Create a new record
 */
export async function create(
  objectType: string,
  record: object
): Promise<RecordResult> {
  const conn = await getSalesforceConnection();
  return await conn.sobject(objectType).create(record);
}


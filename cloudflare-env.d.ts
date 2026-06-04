// Cloudflare environment type declarations.
// Extends the CloudflareEnv interface with custom bindings.

interface SimpleKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
  delete(key: string): Promise<void>;
}

declare global {
  interface CloudflareEnv {
    PERSONALWEB_KV?: SimpleKV;
  }
}

export {};

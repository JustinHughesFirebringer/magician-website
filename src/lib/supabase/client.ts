
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

interface SupabaseConfig {
  url?: string;
  key?: string;
}

// Allow direct configuration or environment variables
export function configureSupabase(config?: SupabaseConfig) {
  const supabaseUrl = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = config?.key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables');
  }

  return { url: supabaseUrl, key: supabaseAnonKey };
}

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Error logging function with performance tracking
export const logClientError = (error: any, context: string) => {
  const errorLog = {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    requestId: error.requestId,
    statusCode: error.status || error.statusCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    })
  }

  console.error(`[Client] Supabase Error in ${context}:`, errorLog)
}

// Create a client with performance tracking
export function createClient(config?: SupabaseConfig, forceNew = false) {
  if (supabaseInstance && !forceNew) return supabaseInstance

  const startTime = Date.now()
  const { url, key } = configureSupabase(config);

  try {
    supabaseInstance = createBrowserClient<Database>(
      url,
      key,
      {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          autoRefreshToken: true,
        },
        global: {
          headers: {
            'x-client-info': '@supabase/ssr@latest',
            'x-client-type': 'browser',
          },
        },
      }
    )

    if (process.env.NODE_ENV === 'development') {
      const initTime = Date.now() - startTime
      console.log(`[Client] Supabase client initialized in ${initTime}ms`)
    }

    return supabaseInstance
  } catch (error) {
    logClientError(error, 'createClient')
    throw error
  }
}

// For direct access when singleton pattern is preferred
export const supabase = createClient()

// Helper function to measure query performance
export async function measureQueryPerformance<T>(
  context: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  try {
    const result = await queryFn()
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - startTime
      console.log(`[Client] Query "${context}" completed in ${duration}ms`)
    }
    return result
  } catch (error) {
    logClientError(error, context)
    throw error
  }
}

// Type-safe query builder helper with performance tracking
export function createQueryBuilder<T extends keyof Database['public']['Tables']>(
  table: T,
  context = `query_${table}`
) {
  const query = supabase.from(table)
  return {
    ...query,
    select: async (...args: Parameters<typeof query.select>) => {
      return measureQueryPerformance(context, () => query.select(...args))
    },
    insert: async (...args: Parameters<typeof query.insert>) => {
      return measureQueryPerformance(`${context}_insert`, () => query.insert(...args))
    },
    update: async (...args: Parameters<typeof query.update>) => {
      return measureQueryPerformance(`${context}_update`, () => query.update(...args))
    },
    delete: async (...args: Parameters<typeof query.delete>) => {
      return measureQueryPerformance(`${context}_delete`, () => query.delete(...args))
    },
  }
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// Validate environment variables
const requiredEnvVars = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

Object.entries(requiredEnvVars).forEach(([name, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name === 'url' ? 'NEXT_PUBLIC_SUPABASE_URL' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'}`)
  }
})

// Error logging for server-side operations
export const logServerError = (error: any, context: string) => {
  console.error(`[Server] Supabase Error in ${context}:`, {
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
  })
}

let serverClient: ReturnType<typeof createServerClient<Database>> | null = null

export function createClient(forceNew = false) {
  if (serverClient && !forceNew) return serverClient

  const cookieStore = cookies()
  const startTime = Date.now()

  try {
    serverClient = createServerClient<Database>(
      requiredEnvVars.url,
      requiredEnvVars.key,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              logServerError(error, 'cookie.set')
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              logServerError(error, 'cookie.remove')
            }
          },
        },
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
        },
        global: {
          headers: {
            'x-server-client': 'true',
          },
        },
      }
    )

    if (process.env.NODE_ENV === 'development') {
      const initTime = Date.now() - startTime
      console.log(`[Server] Supabase client initialized in ${initTime}ms`)
    }

    return serverClient
  } catch (error) {
    logServerError(error, 'createServerClient')
    throw error
  }
}

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
      console.log(`[Server] Query "${context}" completed in ${duration}ms`)
    }
    return result
  } catch (error) {
    logServerError(error, context)
    throw error
  }
}

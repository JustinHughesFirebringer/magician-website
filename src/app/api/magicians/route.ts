import { NextResponse } from 'next/server';
import { searchMagicians } from '@/lib/db/queries';
import { measureQueryPerformance } from '@/lib/supabase/server';
import type { SearchParams } from '@/types/search';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RequestMetrics {
  startTime: number;
  params: Record<string, any>;
  queryDuration?: number;
  totalDuration?: number;
  responseSize?: number;
}

function logRequestMetrics(metrics: RequestMetrics, response?: any, error?: any) {
  const endTime = Date.now();
  metrics.totalDuration = endTime - metrics.startTime;

  if (response) {
    metrics.responseSize = JSON.stringify(response).length;
  }

  const logData = {
    timestamp: new Date().toISOString(),
    path: '/api/magicians',
    params: metrics.params,
    performance: {
      queryDuration: metrics.queryDuration,
      totalDuration: metrics.totalDuration,
      responseSize: metrics.responseSize,
    },
    response: process.env.NODE_ENV === 'development' ? response : undefined,
    ...(error && {
      error: {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    }),
  };

  if (error) {
    console.error('[API] Error in /api/magicians:', logData);
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[API] /api/magicians metrics:', logData);
  }
}

export async function GET(request: Request) {
  const metrics: RequestMetrics = {
    startTime: Date.now(),
    params: {},
  };

  try {
    const { searchParams } = new URL(request.url);
    const params: SearchParams = {
      // Location parameters (support both slug and city/state)
      slug: searchParams.get('slug') || undefined,
      state: searchParams.get('state') || undefined,
      city: searchParams.get('city') || undefined,
      
      // Service parameters
      service: searchParams.get('service') || undefined,
      services: searchParams.getAll('services') || undefined,
      
      // Search query
      query: searchParams.get('query') || undefined,
      
      // Location-based search
      latitude: searchParams.has('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
      longitude: searchParams.has('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
      radius: searchParams.has('radius') ? parseFloat(searchParams.get('radius')!) : undefined,
      
      // Pagination
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('limit') || '10'),
    };

    metrics.params = params;

    // Use measureQueryPerformance to track the database query
    const results = await measureQueryPerformance(
      'searchMagicians',
      () => searchMagicians(params)
    );

    metrics.queryDuration = Date.now() - metrics.startTime;

    if (!results || !results.magicians) {
      const emptyResponse = { 
        magicians: [], 
        total: 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: 0
      };
      
      logRequestMetrics(metrics, emptyResponse);
      return NextResponse.json(emptyResponse, {
        headers: {
          'X-Response-Time': metrics.queryDuration.toString(),
          'X-Total-Results': '0',
          'X-Page': params.page.toString(),
          'X-Page-Size': params.pageSize.toString(),
        }
      });
    }

    logRequestMetrics(metrics, results);
    return NextResponse.json(results, {
      headers: {
        'X-Response-Time': metrics.queryDuration.toString(),
        'X-Total-Results': results.total.toString(),
        'X-Page': results.page.toString(),
        'X-Page-Size': results.pageSize.toString(),
        'X-Total-Pages': results.totalPages.toString(),
      }
    });
  } catch (error: any) {
    logRequestMetrics(metrics, undefined, error);
    
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          error: 'Internal server error',
          details: error.message,
          stack: error.stack,
          params: metrics.params,
        },
        { 
          status: 500,
          headers: {
            'X-Response-Time': (Date.now() - metrics.startTime).toString(),
            'X-Error': 'true',
          }
        }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'X-Response-Time': (Date.now() - metrics.startTime).toString(),
          'X-Error': 'true',
        }
      }
    );
  }
}

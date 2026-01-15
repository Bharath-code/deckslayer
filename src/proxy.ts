import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMIT_CONFIG } from '@/lib/ratelimit'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect the /roast page and /api/roast
    if ((request.nextUrl.pathname.startsWith('/roast') || request.nextUrl.pathname.startsWith('/api/roast')) && !user) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Protect internal routes - only allow admin emails
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (request.nextUrl.pathname.startsWith('/internal')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
        if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
            // Not an admin - redirect to home
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // If logged in and on /auth, redirect to home
    if (request.nextUrl.pathname.startsWith('/auth') && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Rate Limiting for API Routes
    const identifier = user?.id || request.headers.get('x-forwarded-for') || 'anonymous';

    if (request.nextUrl.pathname === '/api/roast') {
        const result = checkRateLimit(`roast:${identifier}`, RATE_LIMIT_CONFIG.ROAST_API);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait before trying again.', resetIn: result.resetIn },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(result.resetIn / 1000)),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            );
        }
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    }

    if (request.nextUrl.pathname === '/api/interrogate') {
        const result = checkRateLimit(`interrogate:${identifier}`, RATE_LIMIT_CONFIG.INTERROGATE_API);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait before trying again.', resetIn: result.resetIn },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(result.resetIn / 1000)),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            );
        }
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

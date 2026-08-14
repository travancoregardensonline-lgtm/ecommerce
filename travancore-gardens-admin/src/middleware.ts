import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    // ── Customer store routes ─────────────────────────────────────────────────
    // Protect /profile — redirect unauthenticated users to /login
    if (pathname.startsWith('/profile') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect logged-in customers away from /login
    if (pathname === '/login' && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // ── Admin routes ──────────────────────────────────────────────────────────
    // Allow /admin/login to pass through freely
    if (pathname === '/admin/login') {
        // If already authenticated admin, skip the login page
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle()

            if (profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'super_admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/admin/dashboard'
                return NextResponse.redirect(url)
            }
        }
        return supabaseResponse
    }

    // All other /admin routes require authentication + admin role
    if (pathname.startsWith('/admin')) {
        // Not logged in → admin login page
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }

        // Logged in but check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        const isAdmin = profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'super_admin'

        if (!isAdmin) {
            // Valid user but not an admin — redirect to admin login with error hint
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            url.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Check if user is authenticated
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // Handle expected "Auth session missing" error for unauthenticated users
    if (error && error.message !== 'Auth session missing!') {
      console.error('Middleware auth error:', error)
    }

    // Allow access to auth pages without authentication
    const authPages = ['/login', '/signup', '/verify-email']
    const isAuthPage = authPages.includes(request.nextUrl.pathname)

    // If user is not authenticated and trying to access protected routes
    if (!user && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is authenticated but email not verified, redirect to verify-email page
    if (user && !user.email_confirmed_at && request.nextUrl.pathname !== '/verify-email') {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }

    // If user is signed in and verified, and trying to access auth pages, redirect to dashboard
    if (user && user.email_confirmed_at && (
        request.nextUrl.pathname === '/login' || 
        request.nextUrl.pathname === '/signup'
    )) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware unexpected error:', error)
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

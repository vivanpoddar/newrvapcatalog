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

    // TEMPORARILY ALLOW ALL ACCESS FOR DEBUGGING
    // If user is signed in and the current path is /login, redirect to /
    if (user && request.nextUrl.pathname === '/login') {
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

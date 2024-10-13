// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };

import { authMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware

export default authMiddleware({
  publicRoutes: ['/site', '/api/uploadthing'], 
  async beforeAuth(auth, req) {
    
  },
  async afterAuth(auth, req) {
    // rewrite for domain 
    const url = req.nextUrl
    const searchParams = url.searchParams.toString()
    let hostname = req.headers

    const pathWithSearchPrams = `${url.pathname}${
      searchParams.length>0?`?${searchParams}`: ''
    }`

    // if subdomain exists
    const customSubDomain = hostname
    .get('host')
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

    if(customSubDomain) {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathWithSearchPrams}`, req.url)
      )
    }

    if(url.pathname === "/sign-in" || url.pathname === "/sign-up") {
      return NextResponse.redirect(
        new URL(`/agency/sign-in`, req.url)
      )
    }
    // trying to access wensite 
    if(
      url.pathname ==="/" || url.pathname ==="/site" 
      && url.host === process.env.NEXT_PUBLIC_DOMAIN
    ) {
      return NextResponse.rewrite(new URL(`/site`,req.url))
    }

    if(url.pathname.startsWith('/agency') || url.pathname.startsWith('/subaccount')) {
      return NextResponse.rewrite(new URL(`${pathWithSearchPrams}`, req.url))
    }

  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
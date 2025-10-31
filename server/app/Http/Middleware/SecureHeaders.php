<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecureHeaders
{
    public function handle(Request $request, Closure $next)
    {

        Log::info('🔒 SecureHeaders middleware executing for: ' . $request->path());

        $response = $next($request);

        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Referrer policy
        $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');

        // Permissions policy (formerly feature-policy)
        $response->headers->set('Permissions-Policy', 'geolocation=(), camera=()');

        // HSTS (only on HTTPS)
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}

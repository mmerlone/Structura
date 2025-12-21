// src/types/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

// A middleware must return a response
export type MiddlewareResponse = NextResponse | Response

// Middleware handler can be either sync or async, but must return a response
export type MiddlewareHandler = (
  request: NextRequest,
  response: NextResponse
) => MiddlewareResponse | Promise<MiddlewareResponse>

// Middleware configuration
export interface Middleware {
  name: string
  handler: MiddlewareHandler
  requiresResponse?: boolean
}

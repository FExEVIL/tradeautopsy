import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_KITE_API_KEY
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/zerodha/callback`
  
  const url = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3&redirect_params=redirect_url=${encodeURIComponent(redirectUrl)}`
  
  return NextResponse.redirect(url)
}
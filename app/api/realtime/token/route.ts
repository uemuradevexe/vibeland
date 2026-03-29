import * as Ably from 'ably'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeClientId } from '@/lib/realtime'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const apiKey = process.env.ABLY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ABLY_API_KEY is not configured' }, { status: 500 })
  }

  const clientId = sanitizeClientId(req.nextUrl.searchParams.get('clientId') ?? '')
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 })
  }

  try {
    const ably = new Ably.Rest(apiKey)
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId,
      capability: JSON.stringify({
        'vibeland:room:*': ['publish', 'subscribe', 'presence'],
      }),
    })

    return NextResponse.json(tokenRequest)
  } catch (error) {
    console.error('[realtime token]', error)
    return NextResponse.json({ error: 'Failed to create realtime token' }, { status: 500 })
  }
}

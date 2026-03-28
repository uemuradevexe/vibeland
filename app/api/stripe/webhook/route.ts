import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as never })

    const sig = req.headers.get('stripe-signature')!
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { metadata?: Record<string, string> }
      const tokens = parseInt(session.metadata?.tokens ?? '0', 10)
      // TODO: credit tokens to player account (requires persistent DB)
      console.log(`[stripe] checkout completed — ${tokens} tokens to grant`)
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('[stripe webhook]', e)
    return NextResponse.json({ error: 'webhook error' }, { status: 400 })
  }
}

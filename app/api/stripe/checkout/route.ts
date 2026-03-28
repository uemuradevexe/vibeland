import { NextRequest, NextResponse } from 'next/server'
import { TOKEN_PACKS } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { packId } = await req.json()
    const pack = TOKEN_PACKS.find((p) => p.id === packId)
    if (!pack) return NextResponse.json({ error: 'invalid pack' }, { status: 400 })

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    // Dynamic import — install stripe package to activate: npm install stripe
    // @ts-expect-error stripe not yet installed (pre-setup)
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as never })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: pack.priceId, quantity: 1 }],
      metadata: { tokens: String(pack.tokens) },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/game?payment=success&tokens=${pack.tokens}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/game`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[stripe checkout]', e)
    return NextResponse.json({ error: 'checkout failed' }, { status: 500 })
  }
}

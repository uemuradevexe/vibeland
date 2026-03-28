// Stripe client — server-side only
// Install: npm install stripe
// import Stripe from 'stripe'
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

// Pre-setup stub — replace with real Stripe when ready
export const STRIPE_ENABLED = process.env.STRIPE_SECRET_KEY !== undefined

export const TOKEN_PACKS = [
  { id: 'starter',  tokens: 500,    price: 199,  label: 'Starter',  priceId: process.env.STRIPE_TOKEN_PACK_500   ?? '' },
  { id: 'popular',  tokens: 2500,   price: 799,  label: 'Popular',  priceId: process.env.STRIPE_TOKEN_PACK_2500  ?? '' },
  { id: 'pro',      tokens: 7500,   price: 1999, label: 'Pro',      priceId: process.env.STRIPE_TOKEN_PACK_7500  ?? '' },
  { id: 'mega',     tokens: 20000,  price: 4999, label: 'Mega',     priceId: process.env.STRIPE_TOKEN_PACK_20000 ?? '' },
] as const

export const VIP_PRICE_PER_MONTH = 499 // cents

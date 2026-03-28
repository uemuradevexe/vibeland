import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('user')
  if (!raw) return NextResponse.json({ error: 'Missing user' }, { status: 400 })

  // Sanitize: GitHub usernames are alphanumeric + hyphens only
  const user = raw.replace(/[^a-zA-Z0-9-]/g, '')
  if (!user || user.length > 39) return NextResponse.json({ error: 'Invalid username' }, { status: 400 })

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
    headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    next: { revalidate: 300 },
  })

  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await res.json()
  return NextResponse.json({
    name: data.name ?? data.login,
    login: data.login,
    repos: data.public_repos,
    followers: data.followers,
    avatar: data.avatar_url,
  })
}

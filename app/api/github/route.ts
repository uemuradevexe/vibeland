import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get('user')
  if (!user) return NextResponse.json({ error: 'Missing user' }, { status: 400 })

  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
    headers,
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

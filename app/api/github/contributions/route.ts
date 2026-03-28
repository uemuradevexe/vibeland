import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 })

  const sanitized = username.replace(/[^a-zA-Z0-9-]/g, '')
  if (!sanitized) return NextResponse.json({ error: 'invalid username' }, { status: 400 })

  try {
    const token = process.env.GITHUB_TOKEN
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'vibeland-game',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalPullRequestReviewContributions
          }
        }
      }
    `
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: { username: sanitized } }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`GitHub API ${res.status}`)
    const data = await res.json()
    const coll = data?.data?.user?.contributionsCollection

    if (!coll) return NextResponse.json({ contributions: 0 })

    const total =
      (coll.totalCommitContributions ?? 0) +
      (coll.totalPullRequestContributions ?? 0) +
      (coll.totalIssueContributions ?? 0) +
      (coll.totalPullRequestReviewContributions ?? 0)

    return NextResponse.json({ contributions: total })
  } catch (e) {
    console.error('[github api]', e)
    return NextResponse.json({ contributions: 0 })
  }
}

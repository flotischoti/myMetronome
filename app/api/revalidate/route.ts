import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { path } = await request.json()
  console.log(`Revalidating path via API Route: ${path}`)
  revalidatePath(path)
  return NextResponse.json({ revalidated: true }, { status: 200 })
}

export async function GET(request: Request) {
  console.log(`Revalidating path via API Call`)
  revalidatePath('/test')
  return NextResponse.json({ revalidated: true }, { status: 200 })
}

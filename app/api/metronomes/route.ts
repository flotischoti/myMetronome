import * as metronomeDb from '../../../db/metronome'
import { NextRequest, NextResponse } from 'next/server'
import { getUserAttrFromToken } from '../../../lib/jwt'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const top = getSearchParam(searchParams, 'top')
  const offset = getSearchParam(searchParams, 'offset')
  const token =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')
  const userId = await getUserAttrFromToken(token!)
  const sortBy = getSearchParam(searchParams, 'sortBy')
  const sortOrder = getSearchParam(searchParams, 'sortOrder')
  const name = getSearchParam(searchParams, 'name')

  const [count, metronomes] = await metronomeDb.list(
    userId!,
    getValidNumberOrUndefined(top),
    getValidNumberOrUndefined(offset),
    sortBy,
    sortOrder,
    name,
  )

  return NextResponse.json({ metronomes, count }, { status: 200 })
}

function getSearchParam(
  searchParams: URLSearchParams,
  name: string,
): string | undefined {
  return (searchParams.get(name) == null ? undefined : searchParams.get(name))!
}

function getValidNumberOrUndefined(value: string | undefined) {
  return !value || Number.isNaN(Number(value)) ? undefined : Number(value)
}

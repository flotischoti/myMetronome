import * as metronomeDb from '../../../db/metronome'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getUserAttrFromToken } from '../util'
import { redirect } from 'next/navigation'

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
    name
  )

  return NextResponse.json({ metronomes, count }, { status: 200 })
}

// Replaced by server action
// export async function POST(request: NextRequest) {
//   const token =
//     request.cookies.get('token')?.value || request.headers.get('x-access-token')
//   const doRedirect = request.headers.get('do-redirect')
//   const userId = await getUserAttrFromToken(token!)
//   const metronome = await metronomeDb.create(await request.json(), userId!)

//   cookies().set({
//     name: 'command',
//     value: 'created',
//     // expires: Date.now() + 5000,
//   })

//   if (doRedirect) {
//     redirect(`/metronome/recent`)
//   } else {
//     return NextResponse.json(metronome, { status: 201 })
//   }
// }

function getSearchParam(
  searchParams: URLSearchParams,
  name: string
): string | undefined {
  return (searchParams.get(name) == null ? undefined : searchParams.get(name))!
}

function getValidNumberOrUndefined(value: string | undefined) {
  return !value || Number.isNaN(Number(value)) ? undefined : Number(value)
}

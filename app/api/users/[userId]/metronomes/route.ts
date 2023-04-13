import { NextApiRequest, NextApiResponse } from 'next'
import * as metronomeDb from '../../../../../db/metronome'
import { ParsedUrlQuery } from 'querystring'

import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { searchParams } = new URL(request.url)
  const top = getSearchParam(searchParams, 'top')
  const offset = getSearchParam(searchParams, 'offset')
  const user = params.userId
  const sortBy = getSearchParam(searchParams, 'sortBy')
  const sortOrder = getSearchParam(searchParams, 'sortOrder')
  const name = getSearchParam(searchParams, 'name')

  if (!isValidUserId(user)) {
    NextResponse.json({}, { status: 403 })
  }

  const metronomes = await metronomeDb.list(
    Number(user),
    getValidNumberOrUndefined(top),
    getValidNumberOrUndefined(offset),
    sortBy,
    sortOrder,
    name
  )

  return NextResponse.json(metronomes, { status: 200 })
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const metronome = await metronomeDb.create(
    await request.json(),
    Number(params.userId)
  )
  return NextResponse.json(metronome, { status: 201 })
}

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { user } = req.query

//   switch (req.method) {
//     case 'GET':
//       break
//     case 'POST':
//       const metronome = await metronomeDb.create(req.body, Number(user))
//       console.log(`saved metronome: ${metronome}`)
//       res.status(201).send(metronome)
//       break
//     case 'PUT':
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

function isValidUserId(userId: String | null): boolean {
  return userId && !Number.isNaN(Number(userId)) ? true : false
}

import * as metronomeDb from '../../../../db/metronome'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  isValidNumber,
  getErrorResponse,
  getUserAttrFromToken,
} from '../../util'
import { StoredMetronome } from '../../../../components/metronome/Metronome'

export async function PUT(request: NextRequest) {
  // TODO verify correctness of metronome body
  const newMetronome: StoredMetronome = await request.json()

  const token =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')
  const userId = await getUserAttrFromToken(token!)

  // TODO replace all this shit by using where clause with metronome + user ID
  const metronome = await metronomeDb.get(newMetronome.id!)

  if (!metronome) {
    return NextResponse.json(
      getErrorResponse(
        `PUT metronome failed. The metronome ${metronomeDb} to be updated was not found`
      ),
      { status: 404 }
    )
  }

  if (metronome.owner != userId) {
    return NextResponse.json(
      getErrorResponse(
        `PUT metronome failed. User ${userId} not allowed to write metronome ${metronomeDb}`
      ),
      { status: 401 }
    )
  }

  const updatedMetronome = await metronomeDb.updateMetronome(newMetronome)
  return NextResponse.json(updatedMetronome, { status: 201 })
}

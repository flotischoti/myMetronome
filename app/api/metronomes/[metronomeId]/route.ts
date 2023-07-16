import * as metronomeDb from '../../../../db/metronome'
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

export async function GET(
  request: NextRequest,
  { params }: { params: { metronomeId: String } }
) {
  const { metronomeId } = params
  const token =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')
  const userId = await getUserAttrFromToken(token!)

  if (!isValidNumber(metronomeId)) {
    return NextResponse.json(
      getErrorResponse(
        `GET metronome failed. Metronome ${metronomeDb} not valid`
      ),
      { status: 403 }
    )
  }

  // TODO replace all this shit by using where clause with metronome + user ID
  const metronome = await metronomeDb.get(Number(metronomeId))

  if (!metronome) {
    return NextResponse.json(
      getErrorResponse(
        `GET metronome failed. Metronome ${metronomeDb} not found`
      ),
      { status: 404 }
    )
  }

  if (metronome.owner != userId) {
    return NextResponse.json(
      getErrorResponse(
        `GET metronome failed. User ${userId} not allowed to read metronome ${metronomeDb}`
      ),
      { status: 401 }
    )
  }
  return NextResponse.json(metronome, { status: 200 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { metronomeId: string } }
) {
  const { metronomeId } = params
  const token =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')
  const userId = await getUserAttrFromToken(token!)

  if (!isValidNumber(metronomeId)) {
    return NextResponse.json(
      getErrorResponse(
        `DELETE metronome failed. Metronome Id ${metronomeDb} not valid`
      ),
      { status: 403 }
    )
  }

  // TODO replace all this shit by using where clause with metronome + user ID
  const metronome = await metronomeDb.get(Number(metronomeId))

  if (!metronome) {
    return NextResponse.json(
      getErrorResponse(
        `DELETE metronome failed. Metronome ${metronomeDb} not found`
      ),
      { status: 404 }
    )
  }

  if (metronome.owner != userId) {
    return NextResponse.json(
      getErrorResponse(
        `DELETE metronome failed. User ${userId} not allowed to delete metronome ${metronomeDb}`
      ),
      { status: 401 }
    )
  }

  let success = await metronomeDb.deleteMetronome(Number(metronomeId))
  const status = success ? 200 : 500
  const message = success
    ? {}
    : { message: `Error deleting metronome with Id: ${params.metronomeId}` }
  return NextResponse.json(message, { status })
}

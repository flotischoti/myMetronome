import * as metronomeDb from '../../../../../../db/metronome'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  const updatedMetronome = await metronomeDb.updateMetronome(
    await request.json()
  )
  return NextResponse.json(updatedMetronome, { status: 201 })
}

export async function GET(
  request: Request,
  { params }: { params: { metronomeId: String } }
) {
  const { metronomeId } = params

  if (!isValidMetronomeId(metronomeId)) {
    return NextResponse.json({}, { status: 403 })
  }

  const metronome = await metronomeDb.get(Number(metronomeId))
  return NextResponse.json(metronome, { status: 200 })
}

export async function DELETE(
  request: Request,
  { params }: { params: { metronomeId: string } }
) {
  const { metronomeId } = params

  if (!isValidMetronomeId(metronomeId)) {
    return NextResponse.json({}, { status: 403 })
  }
  let success = await metronomeDb.deleteMetronome(Number(metronomeId))
  const status = success ? 200 : 500
  const message = success
    ? {}
    : { message: `Error deleting metronome with Id: ${params.metronomeId}` }
  return NextResponse.json(message, { status })
}

function isValidMetronomeId(metronomeId: String): boolean {
  return metronomeId && !Number.isNaN(Number(metronomeId))
}

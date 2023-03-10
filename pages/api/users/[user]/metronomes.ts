import { NextApiRequest, NextApiResponse } from 'next'
import * as metronomeDb from '../../../../db/metronome'
import { ParsedUrlQuery } from 'querystring'

interface MetronomesGetQuery extends ParsedUrlQuery {
  top?: string
  sortBy?: string
  sortOrder?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = req.query
  if (!isValidUserId(user)) {
    res.status(403)
  }

  switch (req.method) {
    case 'GET':
      const {
        top = '10',
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query as MetronomesGetQuery
      const metronomes = await metronomeDb.list(
        Number(user),
        Number(top),
        sortBy,
        sortOrder
      )
      res.status(200).send(metronomes)
      break
    case 'POST':
      const metronome = await metronomeDb.create(req.body, Number(user))
      console.log(`saved metronome: ${metronome}`)
      res.status(201).send(metronome)
      break
    case 'PUT':
  }
}

function isValidUserId(userId: String | String[]): boolean {
  return userId && !Number.isNaN(Number(userId))
}

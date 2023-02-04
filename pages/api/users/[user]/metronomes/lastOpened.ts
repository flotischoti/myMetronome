import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { user, metronome } = req.query
      res.status(200).json({ user, metronome })
    case 'POST':
    case 'PUT':
  }
}

import { listGuestbookEntries, createGuestbookEntry } from '@/lib/fauna'

import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (session) {
    const handlers = {
      GET: async () => {
        const entries = await listGuestbookEntries()
        res.json(entries)
      },

      POST: async () => {
        const {
          body: { name, message },
        } = req
        const created = await createGuestbookEntry({
          name,
          message,
          createdAt: new Date(),
        })

        res.json(created)
      },
    }

    if (!handlers[req.method]) {
      return res.status(405).end()
    }

    await handlers[req.method]()

  } else {
    return res.status(401).end()
  }
}

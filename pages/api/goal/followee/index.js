import { listGoalByFollowee } from '@/lib/fauna'
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (session) {
    const handlers = {
      GET: async () => {
        const list = await listGoalByFollowee(session.user.email)
        res.json(list)
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

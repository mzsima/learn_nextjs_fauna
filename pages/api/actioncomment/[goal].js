import { createActionComment, listActionComments, updateActionGoal } from '@/lib/fauna'
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const session = await getSession({ req })
  const { goal } = req.query

  if (session) {
    const handlers = {
      GET: async () => {
        const list = await listActionComments(goal)
        res.json(list)
      },
      POST: async () => {
        const {
          body: { comment },
        } = req
        const created = await createActionComment({
          user: session.user.email,
          text: comment,
          goal: goal,
        }).catch(e => console.log(e))

        await updateActionGoal(created).catch(e => console.log(e))

        res.json({ created })
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

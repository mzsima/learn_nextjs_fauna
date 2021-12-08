import { createGoal, createGoalRelationships, listGoal } from '@/lib/fauna'
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (session) {
    const handlers = {
      GET: async () => {
        const list = await listGoal(session.user.email)
        console.log(list)
        res.json(list)
      },
      POST: async () => {
        const {
          body: { goal, parent, description },
        } = req
        const created = await createGoal({
          user: session.user.email,
          updatedAt: new Date(),
          goal: goal,
          description: description
        }).catch(e => console.log(e))

        if (parent) {
          await createGoalRelationships({
            parent: parent.id,
            child: created.ref.id,
          }).catch(e => console.log(e))
        }

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

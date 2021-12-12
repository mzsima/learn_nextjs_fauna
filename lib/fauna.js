import { GraphQLClient, gql } from 'graphql-request'
const { Client, query: Q } = require('faunadb')

const CLIENT_SECRET =
  process.env.FAUNA_ADMIN_KEY || process.env.FAUNA_CLIENT_SECRET
const FAUNA_GRAPHQL_BASE_URL = 'https://graphql.fauna.com/graphql'

const graphQLClient = new GraphQLClient(FAUNA_GRAPHQL_BASE_URL, {
  headers: {
    authorization: `Bearer ${CLIENT_SECRET}`,
  },
})

var client = new Client({
  secret: CLIENT_SECRET,
  domain: 'db.fauna.com',
  scheme: 'https',
  port: 443
});


export const listGuestbookEntries = () => {
  const query = gql`
    query Entries($size: Int) {
      entries(_size: $size) {
        data {
          _id
          _ts
          name
          message
          createdAt
        }
      }
    }
  `

  return graphQLClient
    .request(query, { size: 999 })
    .then(({ entries: { data } }) => data)
}

export const createGuestbookEntry = (newEntry) => {
  const mutation = gql`
    mutation CreateGuestbookEntry($input: GuestbookEntryInput!) {
      createGuestbookEntry(data: $input) {
        _id
        _ts
        name
        message
        createdAt
      }
    }
  `

  return graphQLClient.request(mutation, { input: newEntry })
}

export const createGoal = (newGoal) => {
  return client.query(
    Q.Create(
      Q.Collection('Goal'),
      { data: newGoal }
    )
  )
}

export const listGoal = (user) => {
  return client.query(
    // Q.Map(Q.Paginate(
    //   Q.Join(
    //     Q.Match(Q.Index('goals_by_user'), user),
    //     Q.Index('children_from_goal')
    //   )
    // ),
    //   Q.Lambda('goalRef',
    //     Q.Let({
    //       goalDoc: Q.Get(Q.Var('goalRef'))
    //     },
    //       {
    //         id: Q.Select(["ref", "id"], Q.Var("goalDoc")),
    //         goal: Q.Select(["data", "goal"], Q.Var("goalDoc")),
    //         description: Q.Select(["data", "description"], Q.Var("goalDoc")),
    //         user: Q.Select(["data", "user"], Q.Var("goalDoc")),
    //         updated: Q.Select(["ts"], Q.Var("goalDoc")),
    //       })
    //   ))
    Q.Map(
      Q.Paginate(Q.Match(Q.Index("goals_by_user"), user)),
      Q.Lambda("goalRef",
        Q.Let({
          goal: Q.Get(Q.Var("goalRef"))
        }, {
          id: Q.Select(["ref", "id"], Q.Var("goal")),
          goal: Q.Select(["data", "goal"], Q.Var("goal")),
          description: Q.Select(["data", "description"], Q.Var("goal")),
          user: Q.Select(["data", "user"], Q.Var("goal")),
          updated: Q.Select(["ts"], Q.Var("goal")),
          root: Q.IsEmpty(
            Q.Match(Q.Index("parents_from_goal"), Q.Select('ref', Q.Var('goal')))
          ),
          children: Q.Map(
            Q.Paginate(Q.Match(Q.Index("children_from_goal"), Q.Var("goalRef")), { size: 5 }),
            Q.Lambda("X", Q.Select(["id"], Q.Var("X")))
          )
        }))
    )
  )
}

export const listGoalByFollowee = (followee) => {
  return client.query(
    Q.Map(
      Q.Paginate(
        Q.Union(
          Q.Map(
            Q.Append(
              Q.Select(['data'],
                Q.Map(Q.Paginate(Q.Match(Q.Index("followees_by_follower"),
                  Q.Select(["ref"], Q.Get(Q.Match(Q.Index("users_by_email"), followee)))
                )),
                  Q.Lambda("followeeRef", Q.Select(["data", "email"], Q.Get(Q.Var("followeeRef"))))
                )
              ),
              [Q.Select(["data", "email"], Q.Get(Q.Match(Q.Index("users_by_email"), followee)))]
            ),
            Q.Lambda("user", Q.Match(Q.Index("goals_by_user"), Q.Var("user")))
          )
        )
      ),
      Q.Lambda("goalRef", Q.Get(Q.Var("goalRef")))
    )
  )
}

export const createGoalRelationships = (newRelationships) => {
  return client.query(
    Q.Create(
      Q.Collection('GoalRelationships'),
      {
        data: {
          parent: Q.Ref(Q.Collection("Goal"), newRelationships.parent),
          child: Q.Ref(Q.Collection("Goal"), newRelationships.child),
        }
      }
    )
  )
}

export const listGoalRelationships = (user) => {
  return client.query(
    Q.Map(Q.Paginate(Q.Match(
      Q.Index('children_from_goal'), user)
    ),
      Q.Lambda('childRef',
        Q.Let({
          childDoc: Q.Get(Q.Var('childRef'))
        },
          {
            parent: Q.Select(["data", "parent", "ref", "id"], Q.Var("childDoc")),
            child: Q.Select(["data", "child", "ref", "id"], Q.Var("childDoc")),
          })
      ))
  )
}

export const listActionComments = (goal) => {
  return client.query(
    Q.Map(
      Q.Paginate(Q.Match(Q.Index("action_comment_by_goal"), Q.Ref(Q.Collection('Goal'), goal))),
      Q.Lambda("commentRef",
        Q.Let({
          comment: Q.Get(Q.Var("commentRef"))
        }, {
          id: Q.Select(["ref", "id"], Q.Var("comment")),
          user: Q.Select(["data", "user"], Q.Var("comment")),
          goal: Q.Select(["data", "goal"], Q.Var("comment")),
          text: Q.Select(["data", "text"], Q.Var("comment")),
        }))
    )
  )
}

export const createActionComment = (newComment) => {
  return client.query(
    Q.Create(
      Q.Collection('ActionComment'),
      {
        data: {
          ...newComment,
          goal: Q.Ref(Q.Collection('Goal'), newComment.goal),
        }
      }
    )
  )
}

export const loginUsers = (credentials) => {
  return client.query(
    Q.Login(
      Q.Match(Q.Index("users_by_email"), credentials.email),
      { password: credentials.password },
    )
  )
}

export const logoutUsers = () => {
  client.query(Q.Logout(true))
}

export const getUser = (user) => {
  return client.query(
    Q.Map(
      Q.Paginate(Q.Match(Q.Index("users_by_email"), user)),
      Q.Lambda("userRef", Q.Let({
        user: Q.Get(Q.Var("userRef"))}, 
        {
          uid: Q.Select(['ref', 'id'], Q.Var('user')),
          name: Q.Select(["data", "name"], Q.Var("user")), 
          role: Q.Select(["data", "role"], Q.Var("user")), 
        }
      ))
    )
  )
}

export const updateActionGoal = (lastComment) => {
  return client.query(
    Q.Let(
      {
        goal: Q.Get(lastComment.data.goal),
      },
      Q.Update(
        Q.Select(['ref'], Q.Var('goal')),
        {
          data: {
            lastMessage: lastComment.ref,
            lastMessageSeenBy: [lastComment.data.user],
            // lastMessageSeenBy: Append(Select(['data', 'lastMessageSeenBy'], Var('goal'), []), [lastComment.data.user]),
            lastMessageTime: lastComment.ts
          }
        }
      )
    )
  )
}
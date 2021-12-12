const fs = require('fs')
const readline = require('readline')
const request = require('request')
const { Client, query: Q } = require('faunadb')
const streamToPromise = require('stream-to-promise')

const MakeGoalCollection = () =>
  Q.CreateCollection({ name: 'Goal' })

const MakeGoalIndex = () =>
  Q.CreateIndex({
    name: 'goals_by_user',
    source: Q.Collection('Goal'),
    terms: [{ field: ['data', 'user'] }],
  })

const MakeGoalRelationshipsCollection = () =>
  Q.CreateCollection({ name: 'GoalRelationships' })

const MakeGoalRelationshipsIndex = () =>
  Q.CreateIndex({
    name: "children_from_goal",
    source: Q.Collection("GoalRelationships"),
    terms: [{ field: ["data", "parent"] }],
    values: [{ field: ["data", "child"] }]
  })

const MakeActionCommentCollection = () =>
  Q.CreateCollection({ name: 'ActionComment' })

const MakeActionCommentIndex = () =>
  Q.CreateIndex({
    name: 'action_comment_by_goal',
    source: Q.Collection('ActionComment'),
    terms: [{ field: ['data', 'goal'] }],
  })

const MakeUsersCollection = () =>
  Q.CreateCollection({name: 'users'})
  
const MakeUsersIndex = () => 
  Q.CreateIndex({
    name: "users_by_email",
    permissions: { read: "public"},
    source: Q.Collection("users"),
    terms: [{field: ["data", "email"]}],
    unique: true,
  })

const resolveAdminKey = () => {
  if (process.env.FAUNA_ADMIN_KEY) {
    return Promise.resolve(process.env.FAUNA_ADMIN_KEY)
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve, reject) => {
    rl.question('Please provide the Fauna admin key:\n', (res) => {
      rl.close()

      if (!res) {
        return reject(
          new Error('You need to provide a key, closing. Try again')
        )
      }

      resolve(res)
    })
  })
}

const main = async () => {
  const adminKey = await resolveAdminKey()
  const client = new Client({
    secret: adminKey,
    domain: 'db.fauna.com',
    scheme: 'https',
    port: 443
  })

  for (const Make of [
    // MakeGoalCollection,
    // MakeGoalIndex,
    // MakeGoalRelationshipsCollection,
    // MakeGoalRelationshipsIndex,
    // MakeActionCommentCollection,
    // MakeActionCommentIndex,
    // MakeGoalRelationshipsIndex
    MakeUsersCollection,
    MakeUsersIndex
  ]) {
    await client.query(Make())
  }

  console.log('- Created Fauna resources')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

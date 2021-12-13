import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { loginUsers } from "@/lib/fauna"

const providers = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email", placeholder: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      const auth = await loginUsers(credentials)
      if (auth.secret) {
        return { name: credentials.username, email: credentials.email }
      }
      else {
        return res.status(404).send(auth.code)
      }
    }
  })
] 

export default NextAuth({
  // TODO dev
  providers: providers,
  secret: process.env.SECRET
})
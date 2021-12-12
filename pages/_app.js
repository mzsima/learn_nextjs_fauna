import 'tailwindcss/tailwind.css'
import useSWR from 'swr';

import { SessionProvider } from "next-auth/react"

const USER_PATH = '/api/user'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  useSWR(USER_PATH, () => fetch(USER_PATH).then(r => r.json()))
  
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

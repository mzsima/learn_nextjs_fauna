import { Router, useRouter } from "next/dist/client/router"

import Head from 'next/head'
import { useSession, signIn, signOut } from "next-auth/react"


export default function Home() {

  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white"
      style={{
        'backgroundImage': 'linear-gradient(rgb(0 0 0 / 0), rgb(0 0 0 / 0.1))',
      }}>
      <Head>
        <title>Netflix Clone</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className='flex justify-between w-full px-12 py-8'>
        <div className='text-blue-400 text-3xl font-bold'>BETTER ACTION</div>
      {!session &&
          <button 
            className='flex items-center bg-[#e50914] text-white text-sm px-4 py-2 rounded-sm'
            onClick={() => signIn('google')}>Sign in</button>
        }
        {session &&
          <>
            <div className='text-white'>Signed in as {session.user.email} </div>
            <button
              className='flex items-center bg-[#e50914] text-white text-sm px-4 py-2 rounded-sm'
              onClick={() => signOut()}>Sign out</button>
          </>
        }
      </header>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
      {session &&
        <div className="grid grid-cols-1 gap-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button" onClick={() => router.push('/dashboard')}>
          Dashboard
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button" onClick={() => router.push('/guestbook')}>
          Guestbook
        </button>
        </div>
      }
      </main>

    </div>
  )
}

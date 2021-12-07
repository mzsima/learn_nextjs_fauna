import { useSession, signIn, signOut } from "next-auth/react"

export default function Header() {

  const { data: session } = useSession()

  return (
    <header className='flex justify-between w-full px-12 py-8'>
      <div className='text-blue-400 text-3xl font-bold'>BETTER ACTION?</div>
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
  )
}
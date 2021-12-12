import { useSWRUserState } from "context/UserContext"
import { useSession, signIn, signOut } from "next-auth/react"
import { logoutUsers } from "@/lib/fauna"

export default function Header() {

  const { data: session } = useSession()

  const [ user ] = useSWRUserState()

  return (
    <header className='flex justify-between w-full px-12 py-8'>
      <div className='text-blue-400 text-3xl font-bold'>BETTER ACTION?</div>
      {!session &&
        <button
          className='flex items-center bg-[#e50914] text-white text-sm px-4 py-2 rounded-sm'
          onClick={() => signIn()}>Sign in</button>
      }
      {session &&
        <>
          <div className='text-black'>{user && user.data[0].name}</div>
          <button
            className='flex items-center bg-[#e50914] text-white text-sm px-4 py-2 rounded-sm'
            onClick={() => {signOut(); logoutUsers()}}>Sign out</button>
        </>
      }
    </header>
  )
}
import useSWR from 'swr';

const USER_PATH = '/api/user'

export const useSWRUserState = (initialData) => {
  const { data: user, mutate: setUser } = useSWR(USER_PATH, null, {
    initialData: initialData,
  })
  return [user, setUser]
}
import { DashboardContext } from "context/DashboardContext";
import { useContext, useEffect } from "react";
import useSWR, { mutate } from 'swr';
import SlideOver from "./SlideOver";

export default function ActionMessage({ open = false, setOpen, selectedGoal, setSelectedGoal }) {
  const ACTION_COMMNET_PATH = '/api/actioncomment'

  const putActionComment = (payload) => {

    return fetch(ACTION_COMMNET_PATH + '/' + selectedGoal.id, {
      method: 'POST',
      body: JSON.stringify({
        goal: selectedGoal.id,
        comment: payload.target.comment.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => (res.ok ? res.json() : Promise.reject(res)))
  }
  const useActionComment = () => {
    const { data: comments } = useSWR(selectedGoal ? [ACTION_COMMNET_PATH, selectedGoal.id] : null, url => fetch(url + '/' + selectedGoal.id).then(r => r.json()))
    const onSubmit = async (payload) => {
      await putActionComment(payload)
      await mutate([ACTION_COMMNET_PATH, selectedGoal.id])
    }

    return {
      comments,
      onSubmit,
    }
  }
  const { comments, onSubmit } = useActionComment()

  const isMessageFromUser = (r) => {
    return selectedGoal.user === r.user
  }

  return (
    <SlideOver show={open} setOpen={setOpen} title="ゴール課題">
      <div className='flex flex-col h-full px-4'>
        <div className='flex-none my-2 h-6'>
          <div className="text-xl font-semibold">Title: {selectedGoal?.goal}</div>
        </div>

        <div className="flex-grow h-12 space-y-12 grid grid-cols-1 overflow-y-scroll">
          {comments?.data.map((r, i) =>
            <div key={i} className={`${isMessageFromUser(r) ? 'place-self-end' : 'place-self-start'
              } space-y-2`}>
              <div className={`bg-green-100 p-2 rounded-xl ${isMessageFromUser(r) ? 'rounded-tr-none' : 'rounded-tl-none'
                }`}>
                {r.text}
              </div>
            </div>
          )}
        </div>
        <div className="flex-none h-32">
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e)
          }}>
            <label htmlFor="comment" className='block text-sm font-medium text-gray-700 mt-4'>コメント</label>
            <textarea id="comment" name="comment" type='textarea' className='resize-none w-full h-18'></textarea>
            <div>
              <button type="submit" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4'>登録</button>
            </div>
          </form>
        </div>
      </div>
    </SlideOver>
  )
}
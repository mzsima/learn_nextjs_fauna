import Head from 'next/head'
import formatDate from 'date-fns/format'
import Header from '@/components/Header';
import { CheckIcon, PlusCircleIcon, SelectorIcon } from '@heroicons/react/outline';
import SlideOver from '@/components/SlideOver';
import React, { useContext, useState } from 'react';

import { Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react/cjs/react.production.min';
import useSWR, { mutate } from 'swr';

const StatusTable = () => {
  const { goal } = useContext(DashboardContext);


  return (
    <div className='m-4'>
      <table className="border-collapse table-fixed w-full">
        <thead>
          <tr>
            <th className='w-2/12 bg-gray-100'>更新日</th>
            <th className='w-6/12 bg-gray-100'>アクション内容</th>
            <th className='w-4/12 bg-gray-100'>ゴール</th>
          </tr>
        </thead>
        <tbody>
          {goal?.data.map(r => r).map((r, i) =>
            <tr key={i}>
              <td className='p-1 text-center'>{formatDate(new Date(r.updated / 1000), "yyyy-MM-dd")}</td>
              <td className='p-1'> {r?.description}</td>
              <td className='p-1'> {r?.goal} </td>
            </tr>
          )
          }
        </tbody>
      </table>
    </div>
  )
}

const GoalTree = () => {

  const { setPareantGoal, setOpen, goal } = useContext(DashboardContext);

  const openSlide = ({ parent }) => {
    setPareantGoal(parent)
    setOpen(true)
  }

  const goalTextFromId = (id) =>
    goal.data.filter(g => g.id === id).map(g => g.goal)

  return (
    <div className="grid grid-cols-1 gap-x-8 m-4 bg-gray-400 divide-y divide-black">
      {goal?.data.map((r, i) =>
        <div key={i} className='h-32 grid grid-cols-4'>
          <div className='bg-gray-100 m-4 p-2'>{r.goal}</div>
          {r.children.data.map((child, ci) => <div key={ci} className='bg-gray-100 m-4 p-2'>{goalTextFromId(child)}</div>)}
          {r.children.data.length < 3 &&
            <div className="mx-4 my-auto" >
              <button className='bg-gray-300 hover:bg-gray-200 text-gray-800 font-bold inline-flex items-center rounded-full'
                onClick={() => openSlide({ parent: r })}>
                <PlusCircleIcon className="h-6 w-6" />
              </button>
            </div>
          }
        </div>
      )
      }
      <div className='h-24 grid grid-cols-4'>
        <div className='mx-auto my-4'>
          <button className='bg-gray-300 hover:bg-gray-200 text-gray-800 font-bold inline-flex items-center rounded-full'>
            <PlusCircleIcon className="h-6 w-6" />
          </button>
        </div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div >
  )
}

const values = ["なし", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"].map(v => {
  return { id: 1, name: v, unavailable: false }
})

function MyListbox() {
  const [selected, setSelected] = useState(values[0])

  return (
    <div className="w-24 fixed">
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full  border py-2 pl-3 pr-10 text-left bg-white cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
            <span className="block truncate">{selected.name}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {values.map((value, i) => (
                <Listbox.Option
                  key={i}
                  className={({ active }) =>
                    `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                          cursor-default select-none relative py-2 pl-10 pr-4`
                  }
                  value={value}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`${selected ? 'font-medium' : 'font-normal'
                          } block truncate`}
                      >
                        {value.name}
                      </span>
                      {selected ? (
                        <span
                          className={`${active ? 'text-amber-600' : 'text-amber-600'
                            }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                        >
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

const GoalSlideOver = () => {
  const { open, setOpen, parentGoal, onSubmit } = useContext(DashboardContext);

  return (
    <SlideOver show={open} setOpen={setOpen} title="ゴールの作成">
      <div className='h-full'>
        <div className='my-8'>
          <div>親ゴール</div>
          <div>{parentGoal ? parentGoal.goal : "なし"}</div>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ ...e, parent: parentGoal })
        }}>
          <label htmlFor="goal" className='block text-sm font-medium text-gray-700'>ゴールタイトル</label>
          <input id="goal" name="goal" type='text' className='w-full'></input>
          {/* 
        <label className='block text-sm font-medium text-gray-700 mt-8 mb-1'>アクションカテゴリ</label>
        <div className='grid grid-cols-3 gap-2 mx-1'>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4'>AAA</button>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4'>AAA</button>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4'>AAA</button>
        </div> */}

          <label htmlFor="description" className='block text-sm font-medium text-gray-700 mt-8'>説明</label>
          <textarea id="description" name="description" type='textarea' className='w-full h-48'></textarea>

          <label className='block text-sm font-medium text-gray-700 mt-8'>リマインド</label>
          <div className='my-1 h-32'>
            <MyListbox />
          </div>

          <div>
            <button type="submit" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4'>登録</button>
          </div>
        </form>
      </div>
    </SlideOver>
  )
}

const GOAL_PATH = '/api/goal'

const putGoal = (payload) => {
  return fetch(GOAL_PATH, {
    method: 'POST',
    body: JSON.stringify({
      goal: payload.target.goal.value,
      description: payload.target.description.value,
      parent: payload.parent
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => (res.ok ? res.json() : Promise.reject(res)))
}

const useGoalFlow = () => {
  const { data: goal } = useSWR(GOAL_PATH, () => fetch(GOAL_PATH).then(r => r.json()))
  const onSubmit = async (payload) => {
    await putGoal(payload)
    await mutate(GOAL_PATH)
  }

  return {
    goal,
    onSubmit,
  }
}

const DashboardContext = React.createContext()

const Dashboard = () => {
  const [open, setOpen] = useState(false)
  const [parentGoal, setPareantGoal] = useState()
  const { goal, onSubmit } = useGoalFlow()

  return (
    <div className="inset-0 h-screen">
      <Head>
        <title>Dashboard</title>
      </Head>
      <Header />
      <DashboardContext.Provider value={{
        open, setOpen, parentGoal, setPareantGoal, goal, onSubmit
      }}>
        <StatusTable />

        <div className='my-8'>
          <GoalTree />
        </div>

        <GoalSlideOver />
      </DashboardContext.Provider>
    </div >
  )
}

export default Dashboard
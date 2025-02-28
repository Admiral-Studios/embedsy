import { useState } from 'react'

export const useSwitchableSetOfIds = () => {
  const [ids, setIds] = useState<Set<number>>(new Set())

  const toggleId = (id: number) => {
    setIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }

      return newSet
    })
  }

  return { ids, toggleId }
}

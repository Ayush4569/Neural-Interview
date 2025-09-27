import PrejoinPanel from '@/app/(Interview)/_components/PreJoinPanel'
import React from 'react'

const PrejoinPanelPage = async({params}:{params:Promise<{id:string}>}) => {
    const {id} = await params
  return (
    <PrejoinPanel id={id}/>
  )
}

export default PrejoinPanelPage

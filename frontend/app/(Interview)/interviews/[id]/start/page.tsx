import React from 'react'

const InterviewScreen = async({params}:{params:Promise<{id:string}>}) => {
  const {id} = await params 
  return (
   <div></div>
  )
}

export default InterviewScreen

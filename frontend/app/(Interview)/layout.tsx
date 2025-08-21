import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import React,{ReactNode} from 'react'

const InterviewLayout = ({children}:{ 
    children: ReactNode
}) => {
  return (
    <>
      <Navbar/>
      <main>
      {children}
      </main>
      <Footer/>
    </>
  )
}

export default InterviewLayout

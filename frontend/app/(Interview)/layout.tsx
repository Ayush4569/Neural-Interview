import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import React, { ReactNode } from 'react'

const InterviewLayout = ({ children }: {
  children: ReactNode
}) => {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}

export default InterviewLayout

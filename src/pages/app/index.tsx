import { type NextPage } from 'next'
import { useSession } from 'next-auth/react'
import React from 'react'
import { DashboardLayout } from '~/components/dashboard-layout'

const Home: NextPage = () => {
    const { data, status, update } = useSession()

    return (
        <div>
            <DashboardLayout />
        </div>
    )
}

export default Home
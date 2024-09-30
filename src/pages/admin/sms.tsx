import { type NextPage } from 'next'
import { SmsAdminView } from '~/components/sms-admin'
import React from 'react'
import { Navbar } from '~/components/navbar'
import { AdminNavigation } from '~/components/admin-navigation-buttons'
const SMSPage: NextPage = () => {
    return (
        <div>
            <Navbar />
            <AdminNavigation />
            <SmsAdminView />
        </div>
    )
}

export default SMSPage
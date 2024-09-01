import { type NextPage } from 'next'
import { SmsAdminView } from '~/components/sms-admin'
import React from 'react'
import { Navbar } from '~/components/navbar'

const SMSPage: NextPage = () => {
    return (
        <div>
            <Navbar />
            <SmsAdminView />
        </div>
    )
}

export default SMSPage
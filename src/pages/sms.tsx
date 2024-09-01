import { GetServerSideProps, type NextPage } from 'next'
import React from 'react'
import { Navbar } from '~/components/navbar'
import { getServerAuthSession } from '~/server/auth'
import { SmsSection } from '~/components/sms-section'
const SMSPage: NextPage = () => {
    return (
        <div>
            <Navbar />
            <SmsSection />
        </div>
    )
}
export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerAuthSession(ctx);
    if (!session)
        return {
            props: {},
            redirect: {
                destination: '/login',
                permanent: false,
            }
        };
    return { props: {} };
};

export default SMSPage
import { GetServerSideProps, type NextPage } from 'next'
import React from 'react'
import { ContactsTableAdmin } from '~/components/contacts-table-admin'
import { Navbar } from '~/components/navbar'
import { getServerAuthSession } from '~/server/auth'
const Home: NextPage = () => {
    return (
        <div>
            <Navbar />
            <ContactsTableAdmin />
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

export default Home
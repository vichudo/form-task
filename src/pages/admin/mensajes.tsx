import { GetServerSideProps, type NextPage } from 'next'
import React from 'react'
import { SelectableContactsTable } from '~/components/mensajes-admin'
import { Navbar } from '~/components/navbar'
import { getServerAuthSession } from '~/server/auth'

const Home: NextPage = () => {
    return (
        <div>
            <Navbar />
            <SelectableContactsTable />
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
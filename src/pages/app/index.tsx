import { GetServerSideProps, type NextPage } from 'next'
import { useSession } from 'next-auth/react'
import React from 'react'
import { ContactsTable } from '~/components/contacts-table'
import { Navbar } from '~/components/navbar'
import { getServerAuthSession } from '~/server/auth'
const Home: NextPage = () => {
    const { data, status, update } = useSession()

    return (
        <div>
            <Navbar />
            <ContactsTable />
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
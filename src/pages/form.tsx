// FormPage.tsx
import { GetServerSideProps, NextPage } from 'next'
import React from 'react'
import { Form } from '~/components/form'
import { Navbar } from '~/components/navbar'
import { getServerAuthSession } from '~/server/auth'

const FormPage: NextPage = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <Form />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerAuthSession(ctx)
    if (!session)
        return {
            props: {},
            redirect: {
                destination: '/login',
                permanent: false,

            }
        }

    return {
        props: {}
    }
}


export default FormPage
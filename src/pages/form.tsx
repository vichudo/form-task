// FormPage.tsx
import { NextPage } from 'next'
import React from 'react'
import { Form } from '~/components/form'

const FormPage: NextPage = () => {
    return (
        <div className="min-h-screen bg-gray-100">
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

export default FormPage
import React from 'react'
import { trpc } from '~/utils/api'


const Test = () => {
    const { mutateAsync, } = trpc.dummyRouter.loadData.useMutation()

    const handleSubmit = async () => {
        await mutateAsync()
    }
    return (
        <div>
            <button onClick={handleSubmit}>Submit</button>

        </div>
    )
}

export default Test
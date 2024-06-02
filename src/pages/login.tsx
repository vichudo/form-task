
import { type GetServerSideProps, type NextPage } from 'next'
import { Login } from '~/components/simple-login'
// import { getSession } from 'next-auth/react'
import { getServerAuthSession } from '~/server/auth'


const LoginPage: NextPage = () => {
    return (
        <div className='min-h-[100dvh] flex flex-col justify-center items-center bg-gray-50'>
            <Login />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerAuthSession(ctx)
    if (session)
        return {
            props: {},
            redirect: {
                destination: '/app',
                permanent: false,

            }
        }

    return {
        props: {}
    }
}

export default LoginPage
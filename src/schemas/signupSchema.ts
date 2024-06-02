import { z } from 'zod'

import { loginSchema } from './loginSchema'

export const signupSchema = loginSchema
    .merge(
        z.object({
            confirmPassword: z.string().min(6),
        }),
    )
    .superRefine(({ confirmPassword, password }, ctx) => {
        // disabling detect-possible-timing-attacks since this is running on client-side which is not a safe
        // environment anyways
        if (password !== confirmPassword) {
            ctx.addIssue({
                code: 'custom',
                message: 'The passwords did not match',
            })
        }
    })

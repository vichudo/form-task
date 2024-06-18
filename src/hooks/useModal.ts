import { useState } from "react"

export const useModal = () => {
    const [open, setOpen] = useState<boolean>(false)

    return { open, setOpen }
}
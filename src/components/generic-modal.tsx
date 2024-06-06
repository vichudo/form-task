import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export const useModal = () => {
    const [open, setOpen] = useState(false)

    return {
        open,
        setOpen,
    }
}

export type ModalBindings = ReturnType<typeof useModal>

export const GenericModal = ({
    children,
    open = false,
    setOpen,
}: {
    children: ReactNode
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}) => {
    return (
        <Transition.Root show={open}>
            <Dialog as="div" className="relative z-10" onClose={setOpen}>
                <Transition.Child
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                {/* Content Of The Modal */}
                                {open && children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

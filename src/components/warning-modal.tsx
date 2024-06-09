import { Dispatch, FC, SetStateAction } from 'react'
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'

import { GenericModal } from './generic-modal'

export const WarningModal: FC<{
    title: string
    description: string
    bindings: {
        open: boolean
        setOpen: Dispatch<SetStateAction<boolean>>
    }
    buttons: { close: string; confirm: string }
    confirmAction?: () => void
}> = ({ title, description, bindings, buttons, confirmAction }) => {
    const handleConfirmAction = async () => {
        if (confirmAction) {
            confirmAction()
        }
        bindings.setOpen(false)
    }

    return (
        <GenericModal {...bindings}>
            <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                    />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900">
                        {title}
                    </Dialog.Title>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            {description ||
                                'Here goes the description  of your Warning Modal'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleConfirmAction}>
                    {buttons.confirm}
                </button>
                <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => bindings.setOpen(false)}>
                    {buttons.close}
                </button>
            </div>
        </GenericModal>
    )
}

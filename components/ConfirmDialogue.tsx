import React, { useRef } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import {
    ChakraProvider,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button
} from '@chakra-ui/react';

import { theme } from '@/lib/chakra-theme';

interface confirmdialogueProps {
    title: string
    description: string
    btnConfirmTxt: string
}

type alertcomponentProps = confirmdialogueProps & {
    onCancel: () => any
    onConfirm: () => any
}

const AlertComponent = ({ title, description, btnConfirmTxt, onCancel, onConfirm }: alertcomponentProps) => {
    const cancelRef = useRef()

    return (
        <ChakraProvider theme={theme}>
            <AlertDialog isOpen leastDestructiveRef={cancelRef} onClose={onCancel}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontFamily="heading" fontWeight="700" fontSize="2xl">
                            {title}
                        </AlertDialogHeader>

                        <AlertDialogBody color="gray.500" fontSize="sm">
                            {description}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={onConfirm} ml="4">
                                {btnConfirmTxt}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </ChakraProvider>
    )
}

export const ConfirmDialogue = ({
    title = 'Are you sure?',
    description = 'This action is irreversible.',
    btnConfirmTxt = 'Confirm',
}: confirmdialogueProps) => {

    let container = document.getElementById('alert-dialogue')
    if (!container) {
        container = document.createElement('div')
        container.id = 'alert-dialogue'
        document.body.appendChild(container)
    }


    return new Promise<boolean>((resolve) => {
        const close = () => {
            unmountComponentAtNode(container)
            container.remove()
        }

        const handleCancel = () => {
            close()
            resolve(false)
        }

        const handleConfirm = () => {
            close()
            resolve(true)
        }

        render(
            <AlertComponent
                title={title}
                description={description}
                btnConfirmTxt={btnConfirmTxt}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
            />,
            container
        )
    })
}
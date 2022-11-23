import React from 'react';
import { Button } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

interface backlinkProps { }

export const BackLink: React.FC<backlinkProps> = (props) => {
    const router = useRouter()

    return (
        <Button variant="link" leftIcon={<ChevronLeftIcon width="16" />} onClick={router.back} {...props} />
    )
}
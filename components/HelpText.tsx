import React from 'react';
import { Text } from '@chakra-ui/react';

interface helptextProps { }

export const HelpText: React.FC<helptextProps> = (props) => {
    return (
        <Text color="gray.600" lineHeight="tall" fontSize="sm" {...props} />
    )
}
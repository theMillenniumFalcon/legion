import React from 'react';
import { Heading, Text } from '@chakra-ui/react';

interface sectionheadingProps {
    heading: string
    children?: React.ReactNode
}

export const SectionHeading: React.FC<sectionheadingProps> = ({ heading, children }) => {
    return (
        <div>
            <Heading size="md" fontWeight="800" color="gray.600">{heading}</Heading>
            {children !== undefined && (
                <Text mt="2" color="gray.600" lineHeight="tall" fontSize="sm">
                    {children}
                </Text>
            )}
        </div>
    )
}
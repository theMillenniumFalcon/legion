import React from 'react';
import {
    Stat,
    StatLabel,
    StatNumber,
    Divider,
    StatGroup
} from '@chakra-ui/react';

interface apistatsProps {
    successes: number
    fails: number
    avgResponseTime?: number
}

export const ApiStats: React.FC<apistatsProps> = ({ successes, fails, avgResponseTime }) => {
    return (
        <StatGroup gridGap="8">
            <Stat>
                <StatLabel whiteSpace="nowrap" textColor="green.500" fontWeight="600">Successful calls</StatLabel>
                <StatNumber>{successes}</StatNumber>
            </Stat>
            <Divider orientation="vertical" />
            <Stat>
                <StatLabel whiteSpace="nowrap" textColor="red.500" fontWeight="600">Failed calls</StatLabel>
                <StatNumber>{fails}</StatNumber>
            </Stat>
            {
                avgResponseTime !== undefined && (
                    <>
                        <Divider orientation="vertical" />
                        <Stat>
                            <StatLabel whiteSpace="nowrap" textColor="blue.500" fontWeight="600">Average time(ms)</StatLabel>
                            <StatNumber>{avgResponseTime}</StatNumber>
                        </Stat>
                    </>
                )
            }
        </StatGroup>
    )
}
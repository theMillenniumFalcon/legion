import React from 'react';
import { Box, Link } from '@chakra-ui/react';

interface footerProps { }

export const Footer: React.FC<footerProps> = (props) => {
    return (
        <Box mt="auto" textAlign="center" color="gray.600" {...props}>
            Made in 🇮🇳 by <Link href="https://themillenniumfalcon.github.io" fontWeight="500" color="green.500" isExternal>Nishank Priydarshi</Link>
        </Box>
    );
}
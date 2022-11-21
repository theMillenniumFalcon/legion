import Head from 'next/head';
import { Flex, Heading } from '@chakra-ui/react';

const Projects = () => {
    return (
        <>
            <Head>
                <title>Projects | legion</title>
            </Head>
            <Flex height="300px" alignItems="center" justifyContent="center">
                <Heading as="h1" fontWeight="800">Projects</Heading>
            </Flex>
        </>
    )
}

export default Projects
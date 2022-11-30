import { useState, useEffect } from 'react';
import { Box, Flex, Container, ChakraProvider } from '@chakra-ui/react';
import '@fontsource/raleway/700.css';
import '@fontsource/raleway/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

import { Footer } from '../components/Footer';
import { MockDeploymentBanner } from '../components/MockDeploymentBanner';
import { theme } from '@/lib/chakra-theme';

const isMock = process.env.NEXT_PUBLIC_MOCK_DEPLOYMENT === "true"

export default function App({ Component, pageProps }) {
  const [showChild, setShowChild] = useState(false)
  useEffect(() => {
    setShowChild(true)
  }, [])

  if (!showChild) {
    return null
  }
  if (typeof window === 'undefined') {
    return <></>
  } else {
    return (
      <ChakraProvider theme={theme}>
        {isMock && <MockDeploymentBanner />}
        <Box bg="gray.100">
          <Container maxWidth="container.lg">
            <Flex
              direction="column"
              pt="16"
              pb="8"
              px="16"
              minH={`calc(100vh - 4rem${isMock ? ' - 2rem' : ''})`}
              shadow="base"
              bg="white"
              rounded="base"
            >
              <Component {...pageProps} />
            </Flex>
          </Container>

          <Footer />
        </Box>
      </ChakraProvider>
    )
  }

}

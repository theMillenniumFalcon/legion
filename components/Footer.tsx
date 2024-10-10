import { Container, Flex, Link, Text } from '@chakra-ui/react';

export default function Footer(props) {
  return (
    <Container maxWidth="container.lg">
      <Flex mt="auto" alignItems="center" justifyContent="space-between" textAlign="center" px="12" color="gray.500" height="16" {...props} fontSize="sm">
        <Text mt="1">
          Built with ❤️ by {' '}
          <Link href="https://nishank.vercel.app" fontWeight="500" color="blue.400" isExternal>Nishank Priydarshi</Link>
        </Text>
      </Flex>
    </Container>
  );
}

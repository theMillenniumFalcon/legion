import { Container, Flex, Link, Text } from '@chakra-ui/react';

export default function Footer(props) {
  return (
    <Container maxWidth="container.lg">
      <Flex mt="auto" alignItems="center" justifyContent="space-between" textAlign="center" px="12" color="gray.500" height="16" {...props} fontSize="sm">
        <Text mt="1">
          Made by {' '}
          <Link href="https://themillenniumfalcon.github.io" fontWeight="500" color="blue.400" isExternal>Nishank Priydarshi</Link>
          {', '}
          <Link href="https://github.com/gunjan1909" fontWeight="500" color="blue.400" isExternal>Gunjan A. Bhanarkar</Link>
          {' '}& {' '}
          <Link href="https://www.instagram.com/nxmxn_21" fontWeight="500" color="blue.400" isExternal>Naman Kumawat</Link>
        </Text>
      </Flex>
    </Container>
  );
}

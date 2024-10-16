import type { GetServerSideProps } from 'next';
import {
  Flex,
  Button,
  Heading,
  Divider,
  Box,
  Code,
  Text,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Radio,
  RadioGroup,
  Link,
  useToast,
} from '@chakra-ui/react';
import { CheckIcon, ClipboardCopyIcon } from '@heroicons/react/outline';
import { ApiMethod, Project } from '@prisma/client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import copy from 'copy-to-clipboard';
import { useFieldArray, useForm } from 'react-hook-form';

import {
  SectionHeading,
  HelpText,
  ApiStats,
  BackLink,
  QueryParamInput,
  SecretInput,
  ApiMethodTag,
  confirmDialog,
} from '@/components';

import Secrets from '../_secrets';
import DangerZone from '../_danger-zone';
import prisma from '@/lib/prisma';
import { RateLimitingOptions, CachingOptions, RestrictionOptions, PartialQueryOptions } from '@/lib/middlewares';
import { ApiRouteWithMiddlewares, ExpandedHeaders, QueryParams } from '../../../api/v1/_types';
import ProjectSecrets from '@/lib/contexts/ProjectSecrets';

const MiddlewareCard = ({ ...props }) => (
  <Flex
    alignItems="center"
    ml="10"
    bg="white"
    display="inline-flex"
    shadow="base"
    rounded="md"
    px="5"
    py="3"
    border="1px"
    borderColor="gray.200"
    fontSize="sm"
    fontWeight="500"
    color="gray.700"
    {...props}
  />
);

type FormData = {
  method: string;
  apiUrl: string;
  forwardRequestData: boolean;
  queryParams: { name: string, value: string }[];
  headers: { name: string, value: string }[];

  restriction: Omit<RestrictionOptions, 'allowedIps' | 'allowedOrigins'> & {
    allowedIps: string;
    allowedOrigins: string;
  };

  rateLimiting: RateLimitingOptions;
  caching: CachingOptions;

  partialQuery: PartialQueryOptions;
};

const applyQueryParams = (apiUrl: string, query: QueryParams) => {
  const url = new URL(apiUrl);
  const searchParams = new URLSearchParams(query);

  /**
   * Direct toString() is not used as it encodes the special characters
   * making URL harder to read
   */
  const queryString = [...searchParams.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return decodeURI(url.origin + url.pathname) + (queryString ? '?' + queryString : '');
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const routeId = params.routeId as string;

  const apiRoute = await prisma.apiRoute.findUnique({
    where: { id: routeId },
    include: {
      project: {
        include: {
          Secret: {
            select: {
              name: true,
            }
          },
        }
      }
    }
  });

  if (apiRoute === null) {
    return {
      redirect: {
        permanent: false,
        destination: "/404"
      },
    };
  }

  return { props: { apiRoute } };
};

type Props = {
  apiRoute: ApiRouteWithMiddlewares & {
    project: Project & {
      Secret: {
        name: string;
      }[];
    };
  };
};

export default function ApiRoutePage({ apiRoute }: Props) {
  const { register, handleSubmit, getValues, watch, control, setValue, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      apiUrl: applyQueryParams(apiRoute.apiUrl, apiRoute.queryParams as QueryParams),
      method: apiRoute.method,
      forwardRequestData: apiRoute.forwardRequestData,
      queryParams: (apiRoute.queryParams as QueryParams).map(([name, value]) => ({ name, value })) ?? [],
      headers: (apiRoute.headers as ExpandedHeaders).map(([name, value]) => ({ name, value })) ?? [],
      restriction: {
        enabled: apiRoute.restriction.enabled ?? false,
        type: apiRoute.restriction.type ?? 'HTTP',
        allowedIps: apiRoute.restriction.allowedIps?.join?.(', ') ?? '',
        allowedOrigins: apiRoute.restriction.allowedOrigins?.join?.(', ') ?? '',
      },
      rateLimiting: {
        enabled: apiRoute.rateLimiting.enabled ?? false,
        maxRequests: apiRoute.rateLimiting.maxRequests ?? 20,
        windowSize: apiRoute.rateLimiting.windowSize ?? 60,
      },
      caching: {
        enabled: apiRoute.caching.enabled ?? false,
        duration: apiRoute.caching.duration ?? 120,
      },
      partialQuery: {
        enabled: apiRoute.partialQuery.enabled ?? false,
      },
    }
  });
  const { append: appendHeader, remove: removeHeader, fields: headerFields } = useFieldArray({
    control,
    name: 'headers',
  });
  const { append: appendQueryParam, remove: removeQueryParam, fields: queryParamFields } = useFieldArray({
    control,
    name: 'queryParams',
  });

  const router = useRouter();
  const toast = useToast();
  const [proxyUrl, setProxyUrl] = useState('');

  const syncUrlAndQueryParams = useCallback((_, { name, type }) => {
    if (type !== 'change') return;

    const [apiUrl, queryParams] = getValues(['apiUrl', 'queryParams']);

    try {
      if (name === 'apiUrl') {
        const url = new URL(apiUrl);
        setValue('queryParams', [...url.searchParams].map(([name, value]) => ({ name, value })));
      } else if (name.startsWith('queryParams')) {
        const qp: QueryParams = queryParams.map(({ name, value }) => [name, value]);
        setValue('apiUrl', applyQueryParams(apiUrl, qp));
      }
    } catch (err) {
      // Ignore error as further updates might resolve correctly
      console.log(err);
    }
  }, [setValue, getValues]);

  useEffect(() => {
    setProxyUrl(`${window.location.origin}/api/v1/${apiRoute.id}`);
  }, [setProxyUrl, apiRoute.id]);

  useEffect(() => {
    return watch(syncUrlAndQueryParams).unsubscribe;
  }, [watch, syncUrlAndQueryParams]);

  const [
    isRestrictionsEnabled,
    isRateLimitingEnabled,
    isCachingEnabled,
    isPartialQueryEnabled,
  ] = watch([
    'restriction.enabled',
    'rateLimiting.enabled',
    'caching.enabled',
    'partialQuery.enabled',
  ]);

  const copyProxyUrl = () => {
    try {
      copy(proxyUrl);
      toast({ status: "success", title: "Copied proxy URL" });
    } catch {
      toast({ status: "error", title: "Ah! There was an error, maybe try again" });
    }
  };

  const updateRoute = async (e) => {
    try {
      const updatedApiRoute = getValues();
      await axios.post(`/api/routes/${apiRoute.id}`, {
        ...updatedApiRoute,
        queryParams: updatedApiRoute.queryParams.map(({ name, value }) => [name, value]),
        headers: updatedApiRoute.headers.map(({ name, value }) => [name, value]),
        restriction: {
          ...updatedApiRoute.restriction,
          allowedIps: updatedApiRoute.restriction.allowedIps.split(/,\s*/),
          allowedOrigins: updatedApiRoute.restriction.allowedOrigins.split(/,\s*/),
        },
      });
      router.replace(router.asPath, undefined, { scroll: false });
      toast({ status: "success", title: "Changes saved successfully" });
    } catch (err) {
      console.log(err);
      toast({ status: "error", title: "Ah! There was an error, maybe try again" });
    }
  };

  const deleteRoute = async () => {
    const confirmed = await confirmDialog({
      title: `Delete ${apiRoute.name} API route`,
      description: `Deleting this API route will remove all configurations and immediately make the proxy URL unusable. This action is irreversible.`,
      btnConfirmTxt: 'Delete API route',
    });

    if (confirmed) {
      await axios.delete(`/api/routes/${apiRoute.id}`);
      router.replace(`/projects/${apiRoute.project.id}`);
    }
  };

  return (
    <ProjectSecrets.Provider value={apiRoute.project.Secret}>
      <Head>
        <title>{apiRoute.name} | legion</title>
      </Head>
      <BackLink>Project details</BackLink>
      <Flex justifyContent="space-between">
        <Heading mt="4" as="h1" size="lg" fontWeight="800">
          {apiRoute.name}
        </Heading>
        <ApiStats successes={apiRoute.successes} fails={apiRoute.fails} avgResponseTime={apiRoute.avgResponseMs} />
      </Flex>

      {/* Proxy endpoint section */}
      <Box mt="20">
        <SectionHeading heading="🪄 Proxy endpoint">
          legion will forward all the requests made to the below URL to the origin endpoint.
          <br />
          <strong>No API keys are required</strong> and the request and response <strong>structure is same</strong> as that of the origin endpoint.
        </SectionHeading>
        <Flex mt="8" alignItems="center">
          <ApiMethodTag method={apiRoute.method} size="lg" />
          <Text fontWeight="600" mx="4" minWidth="0" textOverflow="ellipsis" overflowX="hidden" whiteSpace="nowrap">
            {proxyUrl}
          </Text>
          <Button
            onClick={copyProxyUrl}
            size="sm"
            ml="auto"
            rightIcon={<ClipboardCopyIcon width="16" />}
            colorScheme="twitter"
            bg="twitter.400"
            flexShrink={0}
          >
            Copy URL
          </Button>
        </Flex>
      </Box>

      <Divider my="20" />

      <form onSubmit={handleSubmit(updateRoute)}>
        {/* Api configuration section */}
        <Box>
          <SectionHeading heading="⚙️ Configuration" />

          <Flex mt="8">
            <FormControl width="150px">
              <FormLabel>Method</FormLabel>
              <Select roundedRight="none" required {...register('method')}>
                {Object.keys(ApiMethod).map((method) => <option key={method} value={method}>{method}</option>)}
              </Select>
            </FormControl>
            <FormControl width="calc(100% - 150px)">
              <FormLabel>Origin endpoint URL</FormLabel>
              <SecretInput
                name="apiUrl"
                control={control}
                inputProps={{ placeholder: 'https://api.example.com', type: 'url', required: true }}
                containerProps={{ ml: '-1px', roundedLeft: 'none' }}
              />
            </FormControl>
          </Flex>

          <FormControl mt="8" display="flex" py="4" justifyContent="space-between" alignItems="center">
            <FormLabel>
              Request data forwarding
              <HelpText mt="2">
                Enabling this option allows query parameters and headers in the client request to be
                <br />forwarded to the origin endpoint. Disabling this option would still pass the query
                <br />parameters and headers configured below.
              </HelpText>
            </FormLabel>
            <Switch colorScheme="twitter" size="lg" {...register('forwardRequestData')} />
          </FormControl>

          <Accordion mt="8" allowMultiple>
            <AccordionItem>
              <AccordionButton as="div" type="button">
                <Flex width="full" alignItems="center">
                  <Text fontWeight="500">Query parameters</Text>
                  <Button
                    type="button"
                    size="sm"
                    ml="auto"
                    mr="2"
                    colorScheme="twitter"
                    bg="twitter.400"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendQueryParam({ name: '', value: '' });
                    }}
                  >
                    Add
                  </Button>
                  <AccordionIcon />
                </Flex>
              </AccordionButton>
              <AccordionPanel>
                <HelpText mb="4">
                  You can refer to secrets in value field using <Code>{"{{ SECRET_NAME }}"}</Code>
                </HelpText>
                {
                  queryParamFields.map((field, idx) => (
                    <QueryParamInput
                      key={field.id}
                      keyProps={register(`queryParams.${idx}.name`)}
                      valueProps={{ name: `queryParams.${idx}.value`, control }}
                      onRemove={() => {
                        removeQueryParam(idx);
                        // Explicit call to watch handler because fieldarray events are not captured by react-hook-form
                        syncUrlAndQueryParams({}, { name: 'queryParams', type: 'change' });
                      }}
                    />
                  ))
                }
                {getValues('queryParams').length === 0 && <Box textAlign="center" my="12" color="gray.600" fontWeight="600">No query parameters added</Box>}
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton as="div" type="button">
                <Flex width="full" alignItems="center">
                  <Text fontWeight="500">Request headers</Text>
                  <Button
                    type="button"
                    size="sm"
                    ml="auto"
                    mr="2"
                    colorScheme="twitter"
                    bg="twitter.400"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendHeader({ name: '', value: '' });
                    }}
                  >
                    Add
                  </Button>
                  <AccordionIcon />
                </Flex>
              </AccordionButton>
              <AccordionPanel>
                <HelpText mb="4">
                  You can refer to secrets in value field using <Code>{"{{ SECRET_NAME }}"}</Code>
                </HelpText>
                {
                  headerFields.map((field, idx) => (
                    <QueryParamInput
                      key={field.id}
                      keyProps={register(`headers.${idx}.name`)}
                      valueProps={{ name: `headers.${idx}.value`, control }}
                      onRemove={() => removeHeader(idx)}
                    />
                  ))
                }
                {getValues('headers').length === 0 && <Box textAlign="center" my="12" color="gray.600" fontWeight="600">No headers added</Box>}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>

        <Divider my="20" />

        {/* Request flow diagram */}
        <Box>
          <SectionHeading heading="📡 Request flow">
            This flow shows all the middlewares applied on calls from receiving a request to returning a response.
          </SectionHeading>
          <Flex mt="10" alignItems="center">
            <Flex flex="1" flexDirection="column" position="relative" mt="2">
              <Flex alignItems="center">
                {/* Request Line */}
                <Box position="absolute" h="1px" bg="gray.300" width="100%" />

                <Flex position="relative" zIndex="10" alignItems="center" width="100%">
                  {isRestrictionsEnabled && <MiddlewareCard>🚫 Restrictions</MiddlewareCard>}
                  {isRateLimitingEnabled && <MiddlewareCard>⏱️ Rate Limiting</MiddlewareCard>}
                  {isCachingEnabled && <MiddlewareCard>📌 Caching read</MiddlewareCard>}

                  {/* Arrow */}
                  <Box as="span" ml="auto" mr="1px" borderWidth="0 1px 1px 0" p="4px" borderColor="gray.400" display="inline-block" transform="rotate(-45deg)" />
                </Flex>
              </Flex>

              <Flex alignItems="center" mt="4" mb="2">
                {/* Response Line */}
                <Box position="absolute" h="1px" bg="gray.300" width="100%" />

                <Flex position="relative" zIndex="10" alignItems="center" width="100%">
                  {/* Arrow */}
                  <Box as="span" ml="1px" borderWidth="0 1px 1px 0" p="4px" borderColor="gray.400" display="inline-block" transform="rotate(135deg)" />
                  {isCachingEnabled && <MiddlewareCard>📌 Caching write</MiddlewareCard>}
                  {isPartialQueryEnabled && <MiddlewareCard>✂️ Partial Query</MiddlewareCard>}

                </Flex>
              </Flex>
            </Flex>

            <MiddlewareCard ml="0" py="4" alignSelf="stretch">
              🌏 Origin
            </MiddlewareCard>
          </Flex>
        </Box>

        <Divider my="20" />

        {/* Middlewares section */}
        <Box>
          <SectionHeading heading="📦 Middlewares">
            Middlewares allow you to add additional functionality before the request reaches the origin endpoint.
            <br />
            Use these only if origin endpoints don&apos;t provide these features already, as they may add processing time.
          </SectionHeading>
          <FormControl mt="8" display="flex" py="4" justifyContent="space-between" alignItems="center">
            <FormLabel>
              🚫 Restrictions
              <HelpText mt="2">
                Restricts access to the API route only to some specific domains or IP addresses.
              </HelpText>
            </FormLabel>
            <Switch colorScheme="twitter" size="lg" {...register('restriction.enabled')} />
          </FormControl>
          {isRestrictionsEnabled && (
            <Box width="95%" ml="auto">
              <FormControl display="flex" py="4" justifyContent="space-between" alignItems="center">
                <FormLabel>Restriction type</FormLabel>
                <RadioGroup colorScheme="twitter">
                  <Radio isRequired value="HTTP" {...register('restriction.type')}>Domains</Radio>
                  <Radio isRequired value="IP" {...register('restriction.type')}>IP addresses</Radio>
                </RadioGroup>
              </FormControl>
              {
                watch('restriction.type') === 'IP' && (
                  <FormControl display="flex" py="4" justifyContent="space-between" alignItems="center">
                    <FormLabel>
                      Whitelist IP addresses
                      <HelpText mt="2">
                        Separate IP addresses by comma.
                        <br />
                        Wildcards, CIDR subnets supported.
                      </HelpText>
                    </FormLabel>
                    <Input
                      width="50%"
                      placeholder="127.0.0.1, 127.0.0.1/24, 10.1.*.*"
                      {...register('restriction.allowedIps')}
                    />
                  </FormControl>
                )
              }
              {
                watch('restriction.type') === 'HTTP' && (
                  <FormControl display="flex" py="4" justifyContent="space-between" alignItems="center">
                    <FormLabel>
                      Whitelist domains
                      <HelpText mt="2">
                        Domains should be fully qualified with protocol.
                        <br />
                        Wildcards not supported currently.
                      </HelpText>
                    </FormLabel>
                    <Input
                      width="50%"
                      placeholder="https://example.com, http://demo.example.com"
                      {...register('restriction.allowedOrigins')}
                    />
                  </FormControl>
                )
              }
            </Box>
          )}

          <FormControl mt="8" display="flex" py="4" justifyContent="space-between" alignItems="center">
            <FormLabel>
              ⏱️ Rate Limiting
              <HelpText mt="2">
                Limits the number of calls every IP address can make within a time interval.
              </HelpText>
            </FormLabel>
            <Switch colorScheme="twitter" size="lg" {...register('rateLimiting.enabled')} />
          </FormControl>
          {
            isRateLimitingEnabled && (
              <Box width="95%" ml="auto">
                <FormControl display="flex" py="4" justifyContent="space-between" alignItems="center">
                  <FormLabel>Max number of requests</FormLabel>
                  <Input
                    type="number"
                    width="20%"
                    required
                    {...register('rateLimiting.maxRequests')}
                  />
                </FormControl>
                <FormControl display="flex" py="4" justifyContent="space-between" alignItems="center">
                  <FormLabel>Window size(in seconds)</FormLabel>
                  <Input
                    type="number"
                    width="20%"
                    required
                    {...register('rateLimiting.windowSize')}
                  />
                </FormControl>
              </Box>
            )
          }

          <FormControl mt="8" display="flex" py="4" justifyContent="space-between" alignItems="center">
            <FormLabel>
              📌 Caching
              <HelpText mt="2">
                Caches the result from origin endpoint and returns it for further calls within a time interval.
              </HelpText>
            </FormLabel>
            <Switch colorScheme="twitter" size="lg" {...register('caching.enabled')} />
          </FormControl>
          {
            isCachingEnabled && (
              <Box width="95%" ml="auto">
                <FormControl display="flex" py="4" justifyContent="space-between" alignItems="center">
                  <FormLabel>Cache duration(in seconds)</FormLabel>
                  <Input
                    type="number"
                    width="20%"
                    required
                    {...register('caching.duration')}
                  />
                </FormControl>
              </Box>
            )
          }

          <FormControl mt="8" display="flex" py="4" justifyContent="space-between" alignItems="center">
            <FormLabel>
              ✂️ Partial Query
              <HelpText mt="2">
                Query for only relevant fields in the JSON response, by passing <Code>legion-filter</Code> query param.
              </HelpText>
              <HelpText>
                Note: This middleware consumes the origin API response and structure of response is not preserved.
              </HelpText>
              <HelpText>
                <Link href="https://github.com/nemtsov/json-mask#syntax" color="green.500" isExternal>Syntax reference</Link>.
              </HelpText>
            </FormLabel>
            <Switch colorScheme="twitter" size="lg" {...register('partialQuery.enabled')} />
          </FormControl>
        </Box>

        {/* Save changes button */}
        <Button
          type="submit"
          position="fixed"
          right="16"
          bottom="8"
          colorScheme="twitter"
          bg="twitter.400"
          shadow="lg"
          rightIcon={<CheckIcon width="16" />}
          isLoading={isSubmitting}
        >
          Save changes
        </Button>
      </form>

      <Divider my="20" />

      {/* Secrets section */}
      <Secrets project={apiRoute.project} />

      <Divider my="20" />

      {/* Deletion section */}
      <DangerZone mb="32" onDelete={deleteRoute} buttonText="Delete API route">
        Deleting an API route immediately disables the above proxy endpoint.
        <br />
        This action is irreverisble.
      </DangerZone>
    </ProjectSecrets.Provider>
  );
}

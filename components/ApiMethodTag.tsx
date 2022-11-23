import React from 'react';
import { Tag, TagProps } from '@chakra-ui/react';
import { ApiMethod } from '@prisma/client';

const config: Record<ApiMethod, TagProps> = {
    GET: {
        children: "GET",
        colorScheme: "green",
    },
    POST: {
        children: "POST",
        colorScheme: "yellow",
    },
    PUT: {
        children: "PUT",
        colorScheme: "blue",
    },
    DELETE: {
        children: "DEL",
        colorScheme: "red",
    },
}

type apimethodtagProps = TagProps & {
    method: ApiMethod
}

export const ApiMethodTag: React.FC<apimethodtagProps> = ({ method, ...props }) => {
    return (
        <Tag flexShrink={0} {...config[method]} {...props} />
    )
}
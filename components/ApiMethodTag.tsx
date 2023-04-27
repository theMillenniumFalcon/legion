import { Tag, TagProps } from '@chakra-ui/react';

type Props = TagProps & {
  method: any;
};

const config: Record<any, TagProps> = {
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
};

export default function ApiMethodTag({ method, ...props }: Props) {
  return <Tag flexShrink={0} {...config[method]} {...props} />;
}

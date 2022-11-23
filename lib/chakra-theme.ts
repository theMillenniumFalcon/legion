import { extendTheme, ThemeConfig } from "@chakra-ui/react";

export const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    fonts: {
        heading: "Raleway",
        body: "Inter",
    },
} as ThemeConfig)
import "@/styles/globals.css";
import { getDefaultProvider } from "ethers";
import type { AppProps } from "next/app";
import { mumbaiFork } from "../../config";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/utils/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <img
        style={{ position: "absolute", right: 0, zIndex: -1 }}
        src="/assets/sismo-landing-art.svg"
        alt="sismo art"
      />
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

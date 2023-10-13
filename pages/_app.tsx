import type { ReactElement, ReactNode } from 'react';

import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Web3Provider, { Connectors } from 'web3-react';
import Head from 'next/head';
import ThemeProvider from '../src/theme/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../src/createEmotionCache';
const { InjectedConnector } = Connectors;

const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface TokyoAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

function TokyoApp(props: TokyoAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] });

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Tokyo Free White NextJS Typescript Admin Dashboard</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      <ThemeProvider>
        <Web3Provider
          connectors={{
            MetaMask,
          }}>
          <CssBaseline />
          {getLayout(<Component {...pageProps} />)}
        </Web3Provider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default TokyoApp;

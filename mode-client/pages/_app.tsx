import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import { ModeTestnet } from "@thirdweb-dev/chains"
import Sidebar from "../components/Sidebar";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <ThirdwebProvider activeChain={ModeTestnet}>
        <Sidebar>
          <Component className={inter.className} {...pageProps} />
        </Sidebar>
      </ThirdwebProvider>
    
  );
}

export default MyApp;

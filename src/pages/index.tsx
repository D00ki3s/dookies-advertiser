import router from "next/router";
import { useEffect, useState } from "react";
import { requestAccounts, getPublicClient, signMessage } from "@/utils";
import { createWalletClient, http, custom, WalletClient, PublicClient } from "viem";
import {
  AuthType,
  SismoConnectButton,
  SismoConnectClientConfig,
} from "@sismo-core/sismo-connect-react";
import { devGroups } from "../../config";
import { sepolia } from "viem/chains";

export enum APP_STATES {
  init,
  receivedProof,
  claimingNFT,
}

// The application calls contracts on Mumbai testnet
const userChain = sepolia;

// with your Sismo Connect app ID and enable dev mode.
// you can create a new Sismo Connect app at https://factory.sismo.io
// The SismoConnectClientConfig is a configuration needed to connect to Sismo Connect and requests data from your users.
// You can find more information about the configuration here: https://docs.sismo.io/build-with-sismo-connect/technical-documentation/react

export const sismoConnectConfig: SismoConnectClientConfig = {
  appId: "0xe54de325f698842c8c54238f273cf5f1",
  devMode: {
    enabled: true,
    devGroups: [devGroups[0]],
  },
};

export default function ProveGitcoinPassportOwnership() {
  const [appState, setAppState] = useState<APP_STATES>(APP_STATES.init);
  const [responseBytes, setResponseBytes] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [account, setAccount] = useState<`0x${string}`>(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );
  const [isAdvertiserAddressKnown, setIsAdvertiserAddressKnown] = useState<boolean>(false);
  const [walletClient, setWalletClient] = useState<WalletClient>(
    createWalletClient({
      chain: userChain,
      transport: http(),
    }) as WalletClient
  );
  const publicClient: PublicClient = getPublicClient(userChain);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setWalletClient(
      createWalletClient({
        chain: userChain,
        transport: custom(window.ethereum, {
          key: "windowProvider",
        }),
      }) as WalletClient
    );

    setIsAdvertiserAddressKnown(localStorage.getItem("advertiserAddress") ? true : false);
    if (isAdvertiserAddressKnown) {
      setAccount(localStorage.getItem("advertiserAddress") as `0x${string}`);
    }
  }, [isAdvertiserAddressKnown]);

  async function connectWallet() {
    const address = await requestAccounts();
    localStorage.setItem("advertiserAddress", address);
    setAccount(address);
    setIsAdvertiserAddressKnown(true);
  }

  useEffect(() => {
    if (APP_STATES.receivedProof === appState) {
      router.push("/dashboard");
    }
  }, [appState]);

  function setResponse(responseBytes: string) {
    setResponseBytes(responseBytes);
    if (appState !== 2) {
      setAppState(APP_STATES.receivedProof);
    }
  }

  return (
    <>
      <div className="container">
        <>
          <h1 style={{ marginBottom: 10 }}>
            Claim that you are a Gitcoin Passport holder and start advertising
          </h1>
          {!isAdvertiserAddressKnown && (
            <p style={{ marginBottom: 40 }}>
              Select on which address you want to advertise and sign it with Sismo Connect
            </p>
          )}

          {isAdvertiserAddressKnown ? (
            <p style={{ marginBottom: 40 }}>You will advertise with {account}</p>
          ) : (
            !error && (
              <button className="connect-wallet-button" onClick={() => connectWallet()}>
                Connect Wallet
              </button>
            )
          )}

          {
            // This is the Sismo Connect button that will be used to create the requests and redirect the user to the Sismo Vault app to generate the proofs from his data
            // The different props are:
            // - config: the Sismo Connect client config that contains the Sismo Connect appId
            // - auths: the auth requests that will be used to generate the proofs, here we only use the Vault auth request
            // - signature: the signature request that will be used to sign an arbitrary message that will be checked onchain, here it is used to sign the airdrop address
            // - onResponseBytes: the callback that will be called when the user is redirected back from the his Sismo Vault to the Sismo Connect App with the Sismo Connect response as bytes
            // You can see more information about the Sismo Connect button in the Sismo Connect documentation: https://docs.sismo.io/build-with-sismo-connect/technical-documentation/react
          }
          {!error && isAdvertiserAddressKnown && appState != APP_STATES.receivedProof && (
            <SismoConnectButton
              // the client config created
              config={sismoConnectConfig}
              // the auth request we want to make
              // here we want the proof of a Sismo Vault ownership from our users
              auth={{ authType: AuthType.VAULT }}
              claim={{ groupId: devGroups[0].groupId }}
              // we use the AbiCoder to encode the data we want to sign
              // by encoding it we will be able to decode it on chain
              signature={{ message: signMessage(account) }}
              // onResponseBytes calls a 'setResponse' function with the responseBytes returned by the Sismo Vault
              onResponseBytes={(responseBytes: string) => setResponse(responseBytes)}
              // Some text to display on the button
              text={"Start advertising"}
            />
          )}

          {/** Simple button to call the smart contract with the response as bytes */}
          {appState == APP_STATES.receivedProof && <h2>Profile verified</h2>}
        </>

        {error && (
          <>
            <h2>{error}</h2>
          </>
        )}
      </div>
    </>
  );
}

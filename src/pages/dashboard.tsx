import Ads from "@/components/Dashboard/Ads/Ads";
import CreateAdForm from "@/components/Dashboard/Ads/CreateAdForm";
import { dookiesContractAddress } from "@/utils";
import { TAd } from "@/utils/types";
import { abi } from "../../abi/Dookies.json";

import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MdOutlineCampaign } from "react-icons/md";
import { publicClient } from "../../config";

function Dashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoadingAds, setIsLoadingAds] = useState<boolean>(false);
  const [account, setAccount] = useState<string>();
  const [ads, setAds] = useState<TAd[]>([]);
  const toast = useToast();

  useEffect(() => {
    setAccount(localStorage.getItem("advertiserAddress") as `0x${string}`);
  }, []);

  useEffect(() => {
    async function getAds() {
      if (typeof window === "undefined") return;
      setIsLoadingAds(true);
      if (account) {
        try {
          const adList = (await publicClient.readContract({
            abi,
            address: dookiesContractAddress as `0x${string}`,
            functionName: "getAdsForAddress",
            args: [account],
          })) as TAd[] | undefined;

          const adsWithMetadata = await Promise.all(
            adList?.map(async (ad) => {
              const ipfsPath = ad.adCreative.split("ipfs://")[1];
              const metadataRes = await fetch("https://ipfs.io/ipfs/" + ipfsPath);
              const metadata = await metadataRes.json();
              return {
                ...ad,
                metadata: {
                  ...metadata,
                  image: "https://ipfs.io/ipfs/" + metadata.image.split("ipfs://")[1],
                },
              };
            }) ?? []
          );

          console.log({ adsWithMetadata });
          setAds(adsWithMetadata);
        } catch (error) {
          console.log({ error });
          toast({ title: "You don't have any ads yet" });
        }
      }
      setIsLoadingAds(false);
    }
    getAds();
  }, [account, toast]);

  return (
    <Box
      p={10}
      background="linear-gradient(285.51deg, rgb(25, 57, 112) -75.32%, rgb(18, 32, 61) 76.45%)"
    >
      <Flex w="full" alignItems="center" flexDir="row" mb={8} justifyContent="space-between">
        <Heading mb="0">Your Dookie Campaigns</Heading>
        <Button
          leftIcon={<MdOutlineCampaign />}
          onClick={onOpen}
          colorScheme="purple"
          textTransform="uppercase"
          color="pink.800"
        >
          Create campaign
        </Button>
      </Flex>
      {!ads?.length && isLoadingAds ? (
        <Spinner />
      ) : (
        !ads?.length && <Text>{"You don't have any campaign yet"}</Text>
      )}
      <Ads ads={ads} />
      <CreateAdForm isOpen={isOpen} onClose={onClose} onOpen={onOpen} setAds={setAds} />
    </Box>
  );
}

export default Dashboard;

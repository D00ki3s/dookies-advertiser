import React, { useEffect, useState } from "react";
import { publicClient } from "../../../../config";
import { abi } from "../../../../abi/Dookies.json";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { dookiesContractAddress } from "@/utils";

type TAd = {
  adCreative: string;
  name: string;
  owner: `0x${string}`;
  paused: boolean;
  storedValue: bigint;
  metadata: any;
};
function Ads() {
  const [ads, setAds] = useState<TAd[]>([]);
  const [account, setAccount] = useState<string>();
  const toast = useToast();

  useEffect(() => {
    setAccount(localStorage.getItem("advertiserAddress") as `0x${string}`);
  }, []);

  useEffect(() => {
    async function getAds() {
      if (typeof window === "undefined") return;
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
    }
    getAds();
  }, [account, toast]);

  return (
    <Box>
      <Heading>Ad Campaigns</Heading>
      {ads?.map((ad) => (
        <Card maxW="sm" key={ad.adCreative}>
          <CardBody>
            <Image src={ad.metadata.image} alt={ad.metadata.description} borderRadius="lg" />
            <Stack mt="6" spacing="3">
              <Heading size="md">{ad.name}</Heading>
              <Text>{ad.metadata.description}</Text>
              <Text color="blue.600" fontSize="2xl">
                {ad.metadata.budget}
              </Text>
            </Stack>
          </CardBody>
          <Divider />
          <CardFooter>
            <ButtonGroup spacing="2">
              <Button variant="outline" colorScheme="orange">
                Edit campaign
              </Button>
              <Button variant="outline" colorScheme="red">
                Pause campaign
              </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>
      ))}
    </Box>
  );
}

export default Ads;

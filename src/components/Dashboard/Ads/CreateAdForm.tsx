import { callContract, dookiesContractAddress, getPublicClient } from "@/utils";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { transactions } from "../../../../broadcast/Dookies.s.sol/5151110/run-latest.json";
import { abi } from "../../../../abi/Dookies.json";
import { abi as ghoAbi } from "../../../../abi/GHO.json";
import { abi as daiAbi } from "../../../../abi/DAI.json";
import {
  PublicClient,
  WalletClient,
  createWalletClient,
  custom,
  http,
  getContract,
  parseUnits,
  parseEther,
  formatUnits,
} from "viem";
import { publicClient } from "../../../../config";
import { ethers } from "ethers";
import { sepolia } from "viem/chains";

// const ghoContract = getContract({
//   abi: ghoAbi,
//   address: "0x5d00fab5f2f97c4d682c1053cdcaa59c2c37900d" as `0x${string}`,
//   publicClient,
// });

type Inputs = {
  title: string;
  description: string;
  budget: string;
  media: File[];
};

function CreateAdForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const toast = useToast();
  const [responseBytes, setResponseBytes] = useState<string>("");
  const [account, setAccount] = useState<`0x${string}`>(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );
  const userChain = sepolia;
  const [walletClient, setWalletClient] = useState<WalletClient>(
    createWalletClient({
      chain: userChain,
      transport: http(),
    }) as WalletClient
  );
  const publicClient: PublicClient = getPublicClient(userChain);
  const contractAddress = transactions[0].contractAddress;

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

    setAccount(localStorage.getItem("advertiserAddress") as `0x${string}`);
    // if (isAirdropAddressKnown) {
    //   setAccount(localStorage.getItem("airdropAddress") as `0x${string}`);
    // }
  }, [userChain]);

  const handleCreateAd: SubmitHandler<Inputs> = async (data) => {
    const formData = new FormData();
    const budget = parseUnits(data.budget as `${number}`, 18);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("budget", data.budget);
    formData.append("media", data.media[0]);
    console.log({ budget: data.budget });
    const uploadedRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploaded = await uploadedRes.json();

    await callContract({
      contractAddress: "0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D",
      abi: ghoAbi,
      userChain,
      method: "approve",
      account,
      publicClient,
      walletClient,
      args: [dookiesContractAddress, budget],
    });
    toast({
      title: "GHO allowance",
      description: `You approved ${formatUnits(budget, 18)} GHO as your spend limit`,
    });

    await callContract({
      contractAddress: dookiesContractAddress,
      args: [data.title, uploaded.cid, budget],
      abi,
      userChain,
      method: "registerAdCampaign",
      account,
      publicClient,
      walletClient,
    });
    toast({
      title: "Creating ad",
      description: "Your ad is being published on-chain..",
    });
  };

  return (
    <Flex
      flexDir="column"
      gap={4}
      background="transparent"
      as="form"
      onSubmit={handleSubmit(handleCreateAd)}
    >
      <Heading>Create an advertisement campaign</Heading>
      <FormControl>
        <FormLabel>Title</FormLabel>
        <FormHelperText mb={2}>{"The title of the ad"}</FormHelperText>
        <Input type="text" {...register("title")} />
      </FormControl>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <FormHelperText mb={2}>{"The description of the add"}</FormHelperText>
        <Input type="textarea" {...register("description")} />
      </FormControl>
      <FormControl>
        <FormLabel>Media</FormLabel>
        <FormHelperText mb={2}>{"The media attached to the add"}</FormHelperText>
        <input type="file" {...register("media")} />
      </FormControl>
      <FormControl>
        <FormLabel>Budget (in GHO)</FormLabel>
        <FormHelperText mb={2}>{"The budget for the ad"}</FormHelperText>
        <NumberInput step={50} min={1} defaultValue={1}>
          <NumberInputField {...register("budget")} />
          <NumberInputStepper>
            <NumberIncrementStepper color="white" />
            <NumberDecrementStepper color="white" />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <Button type="submit" w="fit-content" alignSelf="flex-end">
        Create ad
      </Button>
    </Flex>
  );
}

export default CreateAdForm;

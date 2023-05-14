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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { abi } from "../../../../abi/Dookies.json";
import { abi as ghoAbi } from "../../../../abi/GHO.json";
import {
  PublicClient,
  WalletClient,
  createWalletClient,
  custom,
  http,
  parseUnits,
  formatUnits,
} from "viem";
import { sepolia } from "viem/chains";
import { TAd } from "@/utils/types";

type TCreateAdFormProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  setAds: React.Dispatch<React.SetStateAction<TAd[]>>;
};

type Inputs = {
  title: string;
  description: string;
  budget: string;
  url: string;
  targetedGroups: string[];
  media: File[];
};

const groups = [
  {
    value: "0x311ece950f9ec55757eb95f3182ae5e2",
    label: "Nouns DAO NFT Holder",
    colorScheme: "red",
  },
  {
    value: "0x1cde61966decb8600dfd0749bd371f12",
    label: "Gitcoin Passport Holder",
    colorScheme: "green",
  },
  { value: "0x7fa46f9ad7e19af6e039aa72077064a1", label: "ENS DAO Voter", colorScheme: "blue" },
  { value: "0x94bf7aea2a6a362e07e787a663271348", label: "ETH Whales", colorScheme: "gray" },
  {
    value: "0x3a03c9231f9b3811f71fd268a7c8b906",
    label: "Sismo Lens Follwers",
    colorScheme: "green",
  },
  {
    value: "0xff7653240feecd7448150005a95ac86b",
    label: "Uniswap Contributors",
    colorScheme: "pink",
  },
];

function CreateAdForm({ isOpen, onOpen, onClose, setAds }: TCreateAdFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();
  const toast = useToast();
  const [account, setAccount] = useState<`0x${string}`>(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );

  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  const userChain = sepolia;
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

    setAccount(localStorage.getItem("advertiserAddress") as `0x${string}`);
  }, [userChain]);

  const handleCreateAd: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const budget = parseUnits(data.budget as `${number}`, 18);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("budget", data.budget);
      formData.append("url", data.url);
      formData.append("targetedGroups", data.targetedGroups.join("|"));
      formData.append("media", data.media[0]);
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

      const ipfsPath = uploaded.cid.split("ipfs://")[1];
      const metadataRes = await fetch("https://ipfs.io/ipfs/" + ipfsPath);
      const metadata = await metadataRes.json();
      const mediaUrl = "https://ipfs.io/ipfs/" + metadata.image.split("ipfs://")[1];
      const newAd: TAd = {
        name: data.title,
        adCreative: "https://ipfs.io/ipfs/" + ipfsPath,
        metadata: {
          description: data.description,
          image: mediaUrl,
          name: data.title,
          properties: {
            budget: data.budget,
            url: data.url,
          },
        },
        owner: account,
        paused: false,
        storedValue: budget,
      };
      setAds((ads) => [...ads, newAd]);
      reset();
      toast({
        title: "Ad created",
        description: "Your ad has been published on-chain!",
        status: "success",
      });
      onClose();
    } catch (error) {
      console.log({ error });
      toast({
        title: "Failed to create ad",
        description: "An error occurred creating the campaign",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      size={"xl"}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
      <ModalContent
        background="linear-gradient(285.51deg, rgb(25, 57, 112) -75.32%, rgb(18, 32, 61) 76.45%)"
        as="form"
        onSubmit={handleSubmit(handleCreateAd)}
      >
        <ModalHeader fontSize="3xl">Create an advertisement campaign</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex flexDir="column" gap={4} background="transparent">
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
              <FormLabel>URL</FormLabel>
              <FormHelperText mb={2}>{"The url of the add"}</FormHelperText>
              <Input type="text" {...register("url")} />
            </FormControl>
            <FormControl>
              <FormLabel>Groups</FormLabel>
              <FormHelperText mb={2}>
                {"The groups that you want to target with this add"}
              </FormHelperText>
              <Select
                isMulti
                {...register("targetedGroups")}
                options={groups}
                onChange={(opts) =>
                  setValue(
                    "targetedGroups",
                    opts.map((opt) => opt.value)
                  )
                }
              />
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
          </Flex>
        </ModalBody>

        <ModalFooter w="full" justifyContent="space-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            colorScheme="blue"
            type="submit"
            w="fit-content"
            alignSelf="flex-end"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            loadingText={"Creating.."}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateAdForm;

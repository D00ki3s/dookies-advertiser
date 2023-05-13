import React from "react";
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
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { MdEdit, MdPause } from "react-icons/md";
import { TAd } from "@/utils/types";

function Ads({ ads }: { ads: TAd[] }) {
  return (
    <SimpleGrid columns={3} gap={6}>
      {ads?.map((ad) => (
        <Card maxW="md" key={ad.adCreative}>
          <CardBody>
            <Image
              boxSize="400px"
              objectFit="cover"
              src={ad.metadata.image}
              alt={ad.metadata.description}
              borderRadius="lg"
            />
            <Stack mt="6" spacing="3">
              <Heading size="xl">{ad.name}</Heading>
              <Text fontSize="xl">{ad.metadata.description}</Text>
              <Text color="blue.400" fontWeight="bold" fontSize="2xl">
                Budget: {ad.metadata.properties.budget} GHO
              </Text>
            </Stack>
          </CardBody>
          <Divider />
          <CardFooter>
            <ButtonGroup w="full" justifyContent={"space-between"}>
              <Button leftIcon={<MdPause />} variant="outline" colorScheme="red">
                Pause campaign
              </Button>
              <Button leftIcon={<MdEdit />} variant="outline" colorScheme="orange">
                Edit campaign
              </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export default Ads;

import Ads from "@/components/Dashboard/Ads/Ads";
import CreateAdForm from "@/components/Dashboard/Ads/CreateAdForm";
import { Box } from "@chakra-ui/react";
import React from "react";

function dashboard() {
  return (
    <Box
      p={10}
      background="linear-gradient(285.51deg, rgb(25, 57, 112) -75.32%, rgb(18, 32, 61) 76.45%)"
    >
      <CreateAdForm />

      <Ads />
    </Box>
  );
}

export default dashboard;

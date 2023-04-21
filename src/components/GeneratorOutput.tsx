import { useGenerator } from "@/contexts/GeneratorContext";
import {
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useCallback } from "react";

export default function GeneratorOutput() {
  const {
    originalImage,
    generatedImage,
    resultLoading,
    roomStyle,
    roomType,
    maskedOriginalImage,
    setGeneratedImage,
    setResultLoading,
  } = useGenerator();

  const regenerate = useCallback(() => {
    setResultLoading(true);
    axios
      .post("/api/generate", {
        prompt: `${roomType}, ${roomStyle} style, masterpiece, best quality`,
        imageUrl: originalImage,
        imageMaskUrl: maskedOriginalImage,
      })
      .then((res) => {
        console.log(res.data);
        setGeneratedImage(res.data.artifacts);
        setResultLoading(false);
      })
      .catch((err) => {
        setResultLoading(false);
      });
  }, [
    maskedOriginalImage,
    originalImage,
    roomStyle,
    roomType,
    setGeneratedImage,
    setResultLoading,
  ]);

  return (
    <Flex
      flexDirection={"column"}
      p={8}
      bgColor={"white"}
      borderRadius={8}
      border="1px solid #EFEFEF"
      boxShadow={"md"}
      gap={2}
      align={"left"}
    >
      <Flex justifyContent={"space-between"} w="100%">
        <Text fontWeight={"extrabold"} fontSize={"24px"}>
          Result
        </Text>
        {/* <Flex alignItems={"center"} gap={4}>
          <Text>comparision</Text>
          <Switch
            isChecked={sideBySide}
            onChange={(e) => setSideBySide(e.target.checked)}
          />
        </Flex> */}
      </Flex>
      <VStack
        p={4}
        minH={"50vh"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {resultLoading && (
          <VStack h="100%" alignItems={"center"} justifyContent={"center"}>
            <Spinner
              thickness="6px"
              speed="0.65s"
              emptyColor="gray.200"
              color="primary.0"
              w={"60px"}
              h={"60px"}
            />
            <Text>You result is on the way!</Text>
          </VStack>
        )}
        {!resultLoading && !generatedImage && (
          <Text>No result generated yet.</Text>
        )}
        {!resultLoading && originalImage && generatedImage && (
          <Grid
            w="100%"
            templateColumns={{
              md: "repeat(2, 1fr)",
              base: "repeat(1, 1fr)",
            }}
            gap={4}
          >
            {generatedImage.length === 0 ? (
              <Text color={"red.300"}>
                {"Something when wrong, please try again."}
              </Text>
            ) : (
              generatedImage.map((v: any, idx: any) => (
                <GridItem key={idx} w="100%">
                  <Image
                    alt="restored photo"
                    src={`data:image/jpeg;base64,${v.base64}`}
                    width="100%"
                    borderRadius={8}
                  />
                </GridItem>
              ))
            )}
          </Grid>
        )}
        {!resultLoading && (
          <Button colorScheme={"spaceblue"} onClick={regenerate}>
            Regenerate
          </Button>
        )}
      </VStack>
    </Flex>
  );
}

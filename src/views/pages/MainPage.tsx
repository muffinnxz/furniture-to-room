import GeneratorInput from "@/components/GeneratorInput";
import GeneratorOutput from "@/components/GeneratorOutput";
import { GeneratorProvider } from "@/contexts/GeneratorContext";
import { Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import AppLayout from "../layouts/AppLayout";

export function MainPage() {
  return (
    <AppLayout>
      <GeneratorProvider>
        <VStack textAlign={"center"}>
          <Grid
            templateColumns="repeat(10, 1fr)"
            gap={4}
            p={8}
            w="100%"
            minH={"80vh"}
          >
            <GridItem colSpan={10}>
              <Text fontSize={{ md: "24px", base: "16px" }} fontWeight={600}>
                Work best with furniture picture with high-resolution, no
                background, furniture fit the image frame.
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 10, md: 4 }}>
              <GeneratorInput />
            </GridItem>
            <GridItem colSpan={{ base: 10, md: 6 }}>
              <GeneratorOutput />
            </GridItem>
          </Grid>
        </VStack>
      </GeneratorProvider>
    </AppLayout>
  );
}

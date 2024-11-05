import { Button, Flex } from "@radix-ui/themes";
import { styled } from "@stitches/react";

const Image = styled("img");

export const AppHeader = () => {
  return (
    <Flex justify="between">
      <Image src="/arlink.png" width={64} height={18} />
      <Button>Hello</Button>
    </Flex>
  );
};

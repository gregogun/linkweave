import * as Form from "@radix-ui/react-form";
import { Flex } from "@radix-ui/themes";
import { styled } from "@stitches/react";

const StyledForm = styled(Form.Root, {
  height: "max-content",
  minWidth: 500,
  width: "100%",
  marginBlockStart: "var(--space-5)",
});

type TabValue = "profile" | "links" | "domain";

interface LinksProps {
  setTab: React.Dispatch<React.SetStateAction<TabValue>>;
}

export const Links = (props: LinksProps) => {
  return (
    <StyledForm>
      <Flex direction="column"></Flex>
    </StyledForm>
  );
};

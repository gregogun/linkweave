import { Avatar, Box, Progress, Tabs } from "@radix-ui/themes";
import { styled } from "@stitches/react";
import * as Form from "@radix-ui/react-form";
import { ProfileSetup } from "./components/ProfileSetup";
import { useState } from "react";
import { BsGlobe, BsPersonCircle, BsViewList } from "react-icons/bs";

const StyledTabsList = styled(Tabs.List, {
  boxShadow: "none",
  justifyContent: "center",
});

const StyledTabs = styled(Tabs.Root, {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});

const StyledTabsTrigger = styled(Tabs.Trigger, {
  "& svg": {
    marginInlineEnd: "var(--space-2)",
  },

  "&::before": {
    backgroundColor: "transparent",
  },
});

type TabValue = "profile" | "links" | "domain";

export const Create = () => {
  const [tab, setTab] = useState<TabValue>("profile");

  let progress;

  switch (tab) {
    case "profile":
      progress = 30;
      break;
    case "links":
      progress = 60;
      break;
    case "domain":
      progress = 100;
      break;
    default:
      break;
  }

  return (
    <StyledTabs value={tab} onValueChange={(e) => setTab(e as TabValue)}>
      <Box>
        <StyledTabsList>
          <StyledTabsTrigger value="profile">
            <BsPersonCircle />
            Profile
          </StyledTabsTrigger>
          <StyledTabsTrigger value="links">
            <BsViewList />
            Links
          </StyledTabsTrigger>
          <StyledTabsTrigger value="domain">
            <BsGlobe />
            Domain
          </StyledTabsTrigger>
        </StyledTabsList>
        <Progress
          value={progress}
          color="gray"
          variant="soft"
          highContrast
          style={{ height: 4 }}
        />
      </Box>
      <Tabs.Content value="profile">
        <ProfileSetup setTab={setTab} />
      </Tabs.Content>
      <Tabs.Content value="links"></Tabs.Content>
      <Tabs.Content value="domain"></Tabs.Content>
    </StyledTabs>
  );
};

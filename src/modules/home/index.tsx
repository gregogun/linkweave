// import { Logo } from "@/assets/Logo";
import { Button, Flex, Grid, Text } from "@radix-ui/themes";
import { useConnection } from "arweave-wallet-kit";
// import { BsPlug } from "react-icons/bs";
import { Link as HashLink } from "react-router-dom";

export const Home = () => {
  const { connect, connected } = useConnection();

  return (
    <Grid
      position="absolute"
      style={{
        height: "100%",
        width: "100%",
        placeItems: "center",
        marginBlock: "auto",
        top: 0,
      }}
    >
      <>
        {connected ? (
          <Flex direction="column" gap="3" align="center">
            <Text style={{ color: "var(--accent-11)" }}>
              You have no spaces yet...
            </Text>
            <Button
              variant="soft"
              size="3"
              style={{ justifySelf: "center" }}
              asChild
            >
              <HashLink to="/create">Create a space</HashLink>
            </Button>
          </Flex>
        ) : (
          <Button
            variant="soft"
            size="3"
            style={{ justifySelf: "center" }}
            onClick={() => connect()}
          >
            Connect wallet
          </Button>
        )}
      </>
    </Grid>
  );
};

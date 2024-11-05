import { HashRouter, Routes, Route, Link as HashLink } from "react-router-dom";
import { Box, Button, Flex, Link } from "@radix-ui/themes";
import { useConnection } from "arweave-wallet-kit";
// import { Sidebar } from "./modules/layout/Sidebar";
import { Home } from "./modules/home";
import { Create } from "./modules/create";
import { Logo } from "./assets/Logo";
import { BsPlug } from "react-icons/bs";
import { styled } from "@stitches/react";

const Image = styled("img");

function App() {
  const { disconnect, connected } = useConnection();

  return (
    <HashRouter>
      {/* <Grid style={{ height: "100vh", flex: 1, overflow: "hidden" }}> */}
      {/* {address && <Sidebar />} */}
      <Box
        style={{
          height: "100dvh",
          width: "100dvw",
          backgroundImage: "url(mesh-gradient.avif)",
          backgroundSize: "100%",
          aspectRatio: 16 / 9,
        }}
        position="relative"
      >
        <Flex
          p="3"
          justify="between"
          align="center"
          style={{ width: "100%", height: "max-content" }}
        >
          <Link underline="none" asChild>
            <HashLink to="/">
              <Image src="/andromeda_logo.svg" width={120} />
            </HashLink>
          </Link>
          {connected && (
            <Button variant="soft" onClick={() => disconnect()}>
              <BsPlug />
              Disconnect
            </Button>
          )}
        </Flex>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          {/* <Route path="/profile" element={<Profile />} />
                <Route path="/track" element={<Track />} />
                <Route path="/library" element={<Library />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/settings" element={<Settings />} /> */}
        </Routes>
      </Box>
      {/* </Grid> */}
    </HashRouter>
  );
}

export default App;

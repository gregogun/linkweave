// import AppLogo from "@/assets/icons/AppLogo";
import { Button, Flex, Link } from "@radix-ui/themes";
// import { GoHome, GoHomeFill } from "react-icons/go";
// import { RiSearchLine, RiSearchFill } from "react-icons/ri";
import { styled } from "@stitches/react";
import { Link as HashLink, useLocation } from "react-router-dom";
// import { MdLibraryMusic, MdOutlineLibraryMusic } from "react-icons/md";
import { useConnection } from "arweave-wallet-kit";
import { BsPersonCircle, BsViewList } from "react-icons/bs";

const StyledList = styled("ul", {
  "& svg": {
    fontSize: "var(--font-size-5)",
  },
});

const StyledFlex = styled(Flex);

interface NavItemProps {
  path: string;
  active: boolean;
  children: React.ReactNode;
}

const NavItem = (props: NavItemProps) => (
  <li>
    <Link underline="none" asChild>
      <HashLink to={props.path}>
        <StyledFlex
          gap="2"
          align="center"
          py="2"
          px="3"
          css={{
            alignSelf: "stretch",
            color: props.active ? "var(--accent-9)" : "var(--slate-11)",

            "&:hover": {
              backgroundColor: "var(--slate-3)",
              color: "var(--accent-10)",
            },
          }}
        >
          {props.children}
        </StyledFlex>
      </HashLink>
    </Link>
  </li>
);

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { disconnect } = useConnection();

  return (
    <Flex
      direction="column"
      justify="between"
      p="3"
      style={{
        height: "100vh",
        minWidth: 180,
        maxWidth: 250,
        backgroundColor: "var(--side-panel-background)",
      }}
    >
      <Flex
        style={{
          height: "100%",
        }}
        direction="column"
        align="start"
      >
        <Link
          ml="3"
          style={{
            color: "var(--slate-12)",
            display: "grid",
            placeItems: "center",
          }}
          asChild
        >
          <HashLink to={"/"}>
            Arlink
            {/* <AppLogo /> */}
          </HashLink>
        </Link>

        <Flex direction="column" gap="3" mt="7" asChild>
          <nav style={{ width: "100%" }}>
            <StyledList>
              <NavItem path="/" active={pathname === "/"}>
                <BsPersonCircle />
                Profile
              </NavItem>
              <NavItem path="/links" active={pathname === "/links"}>
                <BsViewList />
                Links
              </NavItem>
            </StyledList>
          </nav>
        </Flex>
      </Flex>
      <Button variant="soft" onClick={() => disconnect()}>
        Logout
      </Button>
    </Flex>
  );
};

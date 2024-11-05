// import { othent } from "@/lib/providers/othent";
import { useActiveAddress } from "arweave-wallet-kit";

export const useAuth = () => {
  const activeAddress = useActiveAddress();
  // const othentAddress = async () => {
  //   const address = await othent.getActiveAddress();
  //   return address;
  // };

  // othentAddress();

  // const address = activeAddress || othentAddress;

  return {
    // isConnected: !!address,
    isConnected: !!activeAddress,
  };
};

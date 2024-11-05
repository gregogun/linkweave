import { getProfile, getProfileProcess } from "../lib/user/profile";
import { useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";

interface UserProfileProps {
  address?: string;
  processId?: string;
}

export const useGetUserProfile = (props: UserProfileProps) => {
  const { data: profileProcess } = useQuery({
    queryKey: ["process", props.address, { type: "profile" }],
    queryFn: () => getProfileProcess(props.address),
    refetchOnWindowFocus: false,
    enabled: !!props.address && !props.processId,
  });

  // instead pass props.processId to getProfileProcess, so we can extract owner address for below query
  const processId = props.processId
    ? props.processId
    : profileProcess?.length
    ? profileProcess[0].node.id
    : "";

  return useQuery({
    queryKey: ["profile", processId],
    enabled: !!processId,
    queryFn: async () => {
      if (!processId) return;

      return getProfile({ processId: processId });
    },
    // onSuccess: (data) => {
    //   console.log("profile: ", { data });
    // },
    // refetchInterval: 5000,
  });
};

export const useIsUserMe = (address: string | undefined) => {
  const activeAddress = useActiveAddress();

  return activeAddress && activeAddress === address ? true : false;
};

export const userHasProfile = (address: string | undefined) => {
  try {
    const {
      data: profileProcess,
      isLoading,
      isSuccess,
    } = useQuery({
      queryKey: ["hasProfile", address],
      queryFn: () => getProfileProcess(address),
      refetchOnWindowFocus: false,
      enabled: !!address,
    });

    const hasProfile =
      isSuccess && profileProcess && profileProcess.length ? true : false;
    return { hasProfile, isLoading };
  } catch (error: any) {
    throw new Error(error);
  }
};

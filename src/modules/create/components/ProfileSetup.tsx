import {
  AspectRatio,
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Spinner,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { BsCamera, BsPersonCircle } from "react-icons/bs";
import * as Form from "@radix-ui/react-form";
import { useActiveAddress } from "arweave-wallet-kit";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProfileProcess, updateProfile } from "@/lib/user/profile";
import { ProfileInfo, SetProfile } from "@/types";
import { useGetUserProfile, userHasProfile } from "@/hooks/appData";
import { gateway, hasNonEmptyValue, throttle } from "@/utils";
import equal from "react-fast-compare";
import { useDebounce } from "@/hooks/useDebounce";

const OUTLINE_OFFSET = 2;

const StyledForm = styled(Form.Root, {
  height: "max-content",
  minWidth: 500,
  width: "100%",
  marginBlockStart: "var(--space-5)",
});
const StyledTextFieldRoot = styled(TextField.Root, {
  backgroundColor: "var(--gray-a3)",
});
const StyledTextArea = styled(TextArea, {
  backgroundColor: "var(--gray-a3)",
});
const StyledLabel = styled(Form.Label, {
  fontSize: "var(--font-size-2)",
  color: "var(--gray-11)",
  marginInlineStart: "var(--space-1)",
  marginBlockEnd: "var(--space-1)",
});
const StyledAvatar = styled(Avatar);

const BANNER_HEIGHT = 128;
const BannerContainer = Box;

const AvatarContainer = Box;
const AVATAR_SIZE = 128;

const AlphaIconButton = styled(IconButton, {
  color: "var(--white-a8)",

  "& svg": {
    width: 12,
    height: 12,
  },

  "&:hover": {
    color: "var(--white-a12)",
  },

  variants: {
    liked: {
      true: {
        color: "var(--accent-9)",
        "&:hover": {
          backgroundColor: "var(--white-a4)",
          color: "var(--accent-10)",
        },
      },
    },
  },
});

const HiddenInput = styled("input", {
  width: 0.1,
  height: 0.1,
  opacity: 0,
  overflow: "hidden",
  position: "absolute",
  zIndex: -1,

  display: "none",
});

const InputContainer = styled(Flex, {
  "& > button": {
    opacity: 0,
  },

  "&:hover": {
    "& > button": {
      opacity: 1,
    },
  },
});

type TabValue = "profile" | "links" | "domain";

interface ProfileSetupProps {
  setTab: React.Dispatch<React.SetStateAction<TabValue>>;
}

export const ProfileSetup = (props: ProfileSetupProps) => {
  const address = useActiveAddress();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileInfo>({
    name: "",
    handle: "",
    bio: "",
    avatar: "",
    banner: "",
  });

  const dirty =
    hasNonEmptyValue(form) &&
    !equal(form, () => (profile?.Info ? profile?.Info : {}));

  const updateDirty = useDebounce(() => {
    setIsDirty(dirty);
  }, 100);

  const { data: profile, isLoading: profileLoading } = useGetUserProfile({
    address,
  });
  const { hasProfile } = userHasProfile(address);

  const avatarUrl = form.avatar
    ? form.avatar
    : `${gateway()}/${profile?.Info?.avatar}`;
  const bannerUrl = form.banner
    ? form.banner
    : `${gateway()}/${profile?.Info?.banner}`;

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner"
  ) => {
    const fileObj = e.target.files && e.target.files[0];

    if (!fileObj) {
      return;
    }

    const reader = new FileReader();

    reader.readAsArrayBuffer(fileObj);

    reader.onload = () => {
      let blob;
      blob = new Blob([fileObj], { type: fileObj.type });
      let url = window.URL.createObjectURL(blob);

      if (type === "avatar") {
        setForm((prev) => ({ ...prev, avatar: url }));
      } else {
        setForm((prev) => ({ ...prev, banner: url }));
      }
    };
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData) as unknown as SetProfile;

    try {
      if (hasProfile) {
        profileMutation.mutate({
          values: data,
          profile: profile?.Info,
          processId: profile?.processId,
        });
      } else {
        try {
          if (!address) {
            throw new Error("No wallet address found");
          }
          const processId = await createProfileProcess({ owner: address });

          if (processId) {
            profileMutation.mutate({
              values: data,
              profile: profile?.Info,
              processId: profile?.processId,
            });
          } else {
            throw new Error("No process ID found");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    // set context state optimistically
    onMutate: async (newProfile) => {
      // prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ["profile", newProfile.processId],
      });

      // snapshot prev value
      const prevProfile = queryClient.getQueryData<ProfileInfo>([
        "profile",
        newProfile.processId,
      ]);

      // optimistically update
      queryClient.setQueryData(["profile", newProfile.processId], {
        ...prevProfile,
        ...newProfile.profile,
      });

      // return ctx obj with snapshot
      return { prevProfile, processId: newProfile.processId };
    },
    onSuccess: () => {
      setForm({
        name: "",
        handle: "",
        bio: "",
        avatar: "",
        banner: "",
      });
      toast.success("Profile successfully updated");
    },
    onError: (error: any, newProfile, ctx: any) => {
      document.body.style.pointerEvents = "none";
      console.error(error);

      if (ctx) {
        queryClient.setQueryData(["profile", ctx.processId], ctx.prevProfile);
      }

      toast.error("Oops! An error occured trying to update you profile", {
        description: "Please try again.",
      });
    },
    onSettled: (res, err, data) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", data.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["process", data.processId, { type: "profile" }],
      });
    },
  });

  useEffect(() => {
    if (!address) {
      navigate("/");
    }
  }, [address]);

  useEffect(() => {
    updateDirty();
  }, [form]);

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Flex direction="column" gap="3" position="relative">
        <BannerContainer
          width="100%"
          style={{ height: BANNER_HEIGHT }}
          position="absolute"
        >
          <AspectRatio ratio={16 / 9}>
            <Avatar
              radius="none"
              src={bannerUrl}
              alt="Profile banner"
              fallback={
                <Box
                  position="absolute"
                  inset="0"
                  style={{ backgroundColor: "var(--accent-8" }}
                />
              }
              style={{
                width: "100%",
                height: BANNER_HEIGHT,
                objectFit: "cover",
                filter: "brightness(0.85)",
              }}
            />
          </AspectRatio>
          <InputContainer
            justify="center"
            align="center"
            position="absolute"
            left="0"
            right="0"
            top="0"
            bottom="0"
            m="auto"
          >
            <HiddenInput
              ref={bannerInputRef}
              onChange={(e) => handleFileChange(e, "banner")}
              name="banner"
              type="file"
              accept={"image/jpeg, image/png, image/webp, image/avif"}
              disabled={profileLoading}
            />
            <AlphaIconButton
              onClick={() => bannerInputRef.current?.click()}
              size="4"
              color="gray"
              variant="ghost"
              type="button"
              css={{
                color: "var(--white-a12)",
                backgroundColor: "var(--white-a3)",
                backdropFilter: "blur(2px)",

                "&:hover": {
                  backgroundColor: "var(--white-a4)",
                },

                "& svg": {
                  width: 16,
                  height: 16,
                },
              }}
            >
              <BsCamera />
            </AlphaIconButton>
          </InputContainer>
        </BannerContainer>
        <Flex
          align="center"
          mb="3"
          style={{
            marginBlockStart: AVATAR_SIZE / 2 + BANNER_HEIGHT - AVATAR_SIZE,
          }}
        >
          <AvatarContainer ml="5" style={{ position: "relative" }}>
            <StyledAvatar
              radius="full"
              src={avatarUrl}
              fallback={
                <BsPersonCircle
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    color: "var(--accent-a8)",
                    backgroundColor: "var(--accent-8)",
                  }}
                />
              }
              style={{
                filter: "brightness(0.85)",
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                outline: `${OUTLINE_OFFSET}px solid var(--gray-a3)`,
                outlineOffset: -OUTLINE_OFFSET,
              }}
              css={{
                overflow: "hidden",
                ".rt-AvatarFallback > div": {
                  borderRadius: 0,
                },
              }}
            />
            <InputContainer
              justify="center"
              align="center"
              position="absolute"
              left="0"
              right="0"
              top="0"
              bottom="0"
              m="auto"
            >
              <HiddenInput
                ref={avatarInputRef}
                onChange={(e) => handleFileChange(e, "avatar")}
                name="avatar"
                type="file"
                accept={"image/jpeg, image/png, image/webp, image/avif"}
                disabled={profileLoading}
              />
              <AlphaIconButton
                onClick={() => avatarInputRef.current?.click()}
                size="3"
                color="gray"
                variant="ghost"
                type="button"
                css={{
                  color: "var(--white-a12)",
                  backgroundColor: "var(--white-a3)",
                  backdropFilter: "blur(2px)",

                  "&:hover": {
                    backgroundColor: "var(--white-a4)",
                  },

                  "& svg": {
                    width: 16,
                    height: 16,
                  },
                }}
              >
                <BsCamera />
              </AlphaIconButton>
            </InputContainer>
          </AvatarContainer>
        </Flex>

        <Flex direction="column" gap="5" p="3" style={{ zIndex: 0 }}>
          <Form.Field name="name">
            <Flex justify="between" align="baseline">
              <StyledLabel>Name</StyledLabel>
              <Form.Message match="valueMissing" asChild>
                <Text size="1" color="red">
                  Please enter your name
                </Text>
              </Form.Message>
              <Form.Message match="tooShort" asChild>
                <Text size="1" color="red">
                  Name must be at least 1 character
                </Text>
              </Form.Message>
            </Flex>
            <Form.Control asChild>
              <StyledTextFieldRoot
                size="3"
                placeholder="Name"
                required
                minLength={1}
                value={form.name || profile?.Info?.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                disabled={profileLoading}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field name="handle">
            <Flex justify="between" align="baseline">
              <StyledLabel>Handle</StyledLabel>
              <Form.Message match="valueMissing" asChild>
                <Text size="1" color="red">
                  Please enter your handle
                </Text>
              </Form.Message>
              <Form.Message match="tooShort" asChild>
                <Text size="1" color="red">
                  Handle must be at least 1 character
                </Text>
              </Form.Message>
            </Flex>
            <Form.Control asChild>
              <StyledTextFieldRoot
                size="3"
                placeholder="Handle"
                required
                minLength={1}
                value={form.handle || profile?.Info?.handle}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                disabled={profileLoading}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field name="bio">
            <Flex justify="between" align="baseline">
              <StyledLabel>Bio</StyledLabel>
              <Form.Message match="tooLong" asChild>
                <Text size="1" color="red">
                  Bio is too long
                </Text>
              </Form.Message>
            </Flex>
            <Form.Control asChild>
              <StyledTextArea
                size="3"
                placeholder="Bio"
                maxLength={140}
                value={form.bio || profile?.Info?.bio}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                disabled={profileLoading}
              />
            </Form.Control>
            <Form.Message asChild>
              <Text size="1" color="gray" ml="1">
                Max. 140 characters
              </Text>
            </Form.Message>
          </Form.Field>
          <Flex justify="end" align="center" gap="3">
            {isDirty && (
              <Text color="gray" size="2" style={{ marginInlineEnd: "auto" }}>
                You have unsaved changes...
              </Text>
            )}
            <Button
              type="submit"
              disabled={!isDirty || profileMutation.isPending}
              color="gray"
              highContrast
            >
              {profileMutation.isPending && <Spinner />}
              {profileMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button
              color="gray"
              variant="soft"
              onClick={() => props.setTab("links")}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </StyledForm>
  );
};

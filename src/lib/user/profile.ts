import { createAndSignDataItem, sleep } from "../../utils";
import { sendMessage, spawnProcess } from "../providers/ao";
import { gql } from "../helpers/gql";
import { profileProcessTemplate } from "./processes/profileTemplate";
import { dryrun } from "@permaweb/aoconnect";
import { AOProfile, ProfileInfo, SetProfile } from "../../types";
// import { uploadFile } from "../providers/irys";
import { appConfig } from "@/config";
import { uploadFileTurbo } from "../providers/turbo";
import { Tag } from "arweave-graphql";

const PROFILE_NAME = "Profile-Test10";

export const updateProfile = async ({
  profile,
  values,
  processId,
}: {
  values: SetProfile;
  profile: ProfileInfo | undefined;
  processId: string | undefined;
}) => {
  if (!processId) {
    throw new Error("Process ID is required.");
  }

  let avatarId: string = "";
  let bannerId: string = "";

  if (values.avatar && values.avatar.size > 0) {
    try {
      const tags: Tag[] = [{ name: "Content-Type", value: values.avatar.type }];
      const dataItem = await createAndSignDataItem(values.avatar, tags);

      avatarId = await uploadFileTurbo(dataItem.getRaw());
    } catch (error) {
      console.error(error);
      throw new Error("Avatar failed to upload");
    }
  }

  if (values.banner && values.banner.size > 0) {
    try {
      const tags: Tag[] = [{ name: "Content-Type", value: values.banner.type }];
      const dataItem = await createAndSignDataItem(values.banner, tags);

      bannerId = await uploadFileTurbo(dataItem.getRaw());
    } catch (error) {
      console.error(error);
      throw new Error("Banner failed to upload");
    }
  }

  const name = values.name || profile?.name || "";
  const handle = values.handle || profile?.handle || "";
  const bio = values.bio || profile?.bio || "";
  const avatar = avatarId || profile?.avatar || "";
  const banner = bannerId || profile?.banner || "";

  const profileJSON = JSON.stringify({
    name,
    handle,
    bio,
    avatar,
    banner,
    // updatedAt: Date.now(),
  });

  try {
    const messageId = await sendMessage({
      processId,
      action: "Update",
      data: profileJSON,
      tags: [
        {
          name: "Name",
          value: name,
        },
        {
          name: "Handle",
          value: handle,
        },
        {
          name: "Bio",
          value: bio,
        },
        {
          name: "Avatar",
          value: avatar,
        },
        {
          name: "Banner",
          value: banner,
        },
      ],
    });

    // const results = await readMessageResult({ messageId, processId });
    // return results;
    // console.log(results);

    return messageId;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getProfile = async ({ processId }: { processId: string }) => {
  // console.log({ processId });
  try {
    const result = await dryrun({
      process: processId,
      tags: [{ name: "Action", value: "Info" }],
    });

    // console.log(result);

    const message = result.Messages[0];

    if (!message) {
      throw new Error("No messages found");
    }

    if (message.Error) {
      throw new Error(message.Error);
    }

    const data: AOProfile & { processId: string } = JSON.parse(message.Data);
    return {
      ...data,
      processId,
    };
  } catch (error: any) {
    console.error(error);

    const emptyProfile: AOProfile & { processId: string } = {
      Owner: "",
      Followers: [],
      Following: [],
      Info: {
        name: "",
        handle: "",
        bio: "",
        avatar: "",
        banner: "",
      },
      processId,
    };

    return emptyProfile;
    // throw new Error(error);
  }
};

export const createProfileProcess = async ({ owner }: { owner: string }) => {
  const maxRetries = 5;
  let attempts = 0;
  let processId = "";

  while (attempts < maxRetries) {
    try {
      // Only create a new process if processId is not already set
      if (!processId) {
        processId = await spawnProcess({
          tags: [
            {
              name: "Name",
              value: PROFILE_NAME,
            },
            {
              name: "Dapp-Name",
              value: appConfig.appName,
            },
          ],
        });
      }

      const intialized = await gql({
        variables: {
          owners: [owner],
          recipients: [processId],
          tags: [
            {
              name: "Data-Protocol",
              values: ["ao"],
            },
            {
              name: "Type",
              values: ["Message"],
            },
            {
              name: "Action",
              values: ["Eval"],
            },
            {
              name: "Ctx",
              values: ["Init"],
            },
          ],
        },
      }).then((res) => res.transactions.edges.length > 0);

      if (intialized) {
        return processId;
      } else {
        await sleep(2000);

        await initializeProfileProcess(processId).then((messageId) =>
          console.log("initialized process with ID: ", messageId)
        );

        return processId;
      }
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed: ${error}`);
      if (attempts >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error}`);
      }
      // wait for 1 sec before retrying
      await sleep(1000);
    }
  }
};

export const getProfileProcess = async (owner: string | undefined) => {
  try {
    if (!owner) {
      throw new Error("No owner address found");
    }

    const profileProcessRes = await gql({
      variables: {
        owners: [owner],
        tags: [
          {
            name: "Data-Protocol",
            values: ["ao"],
          },
          {
            name: "Type",
            values: ["Process"],
          },
          {
            name: "Name",
            values: [PROFILE_NAME],
          },
        ],
      },
    });

    const profileProcess = profileProcessRes.transactions.edges;
    // console.log({ profileProcess });

    return profileProcess;
  } catch (error) {
    console.error(error);
  }
};

export const initializeProfileProcess = async (processId: string) => {
  try {
    const messageId = await sendMessage({
      processId: processId,
      action: "Eval",
      data: profileProcessTemplate,
      tags: [
        {
          name: "Ctx",
          value: "Init",
        },
        // {
        //   name: "Dapp-Name",
        //   value: appConfig.appName,
        // },
      ],
    });

    /* future work - we can now use this messageId to do smth like run a fetch and match the associated data with our template to verify it as a valid profile */

    return messageId;
  } catch (error: any) {
    throw new Error(error);
  }
};

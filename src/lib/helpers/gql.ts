import { appConfig } from "@/config";
import { GQLQuery } from "../../types";
import { gateway } from "../../utils";
import arweaveGql, { TagFilter } from "arweave-graphql";

/**
 *
 * @description Intended for simple, non-parallel queries.
 */
export const gql = async ({ variables }: GQLQuery) => {
  try {
    const defaultTags: TagFilter[] = [
      // {
      //   name: "Dapp-Name",
      //   values: [appConfig.appName],
      // },
      // {
      //   name: "Variant",
      //   values: ["0.0.1"],
      // },
    ];

    variables.tags = variables.tags || [];
    const mergedTags = [...defaultTags, ...(variables.tags as TagFilter[])];

    const res = await arweaveGql(`${gateway()}/graphql`).getTransactions({
      ...variables,
      tags: mergedTags,
    });

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Error occured whilst fetching data: ${error.message}`);
  }
};

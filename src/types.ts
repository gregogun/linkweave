import { GetTransactionsQueryVariables, Tag } from "arweave-graphql";

//ao
export interface SpawnProcessParams {
  moduleTxId?: string;
  scheduler?: string;
  tags?: Tag[];
}

export interface SendMessageParams {
  processId: string;
  action: string;
  data?: string;
  tags?: Tag[];
}

export interface MessageResult {
  Messages: any[]; // Replace 'any' with the specific message type from aoconnect
  Spawns: any[]; // Replace 'any' with the specific spawn type from aoconnect
  Output: string;
  Error?: string;
}

export interface ReadResultParams {
  messageId: string;
  processId: string;
}

//aoprofile
export interface AOProfile {
  Owner: string;
  Info: ProfileInfo | undefined;
  Followers: string[];
  Following: string[];
}

export interface ProfileInfo {
  name: string | undefined;
  handle: string | undefined;
  bio: string | undefined;
  avatar: string | undefined;
  banner: string | undefined;
}

export interface SetProfile {
  name: string | undefined;
  handle: string | undefined;
  bio?: string | undefined;
  avatar?: File | undefined;
  banner?: File | undefined;
}

//query
export interface GQLQuery {
  variables: GetTransactionsQueryVariables;
}

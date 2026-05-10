import type { Name, User } from "../../../prisma/generated/models";

export type NameWithNicknames = Name & {
  nicknames: {
    nickname: {
      nickname: string;
    };
  }[];
  _count?: {
    likes?: number;
  };
  addedBy?: User | null;
};

export type tParams = Promise<{ slug: string[] }>;

export type NameQueryResult = {
  data: NameWithNicknames[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type SocialSignInProviders =
  | "github"
  | "apple"
  | "discord"
  | "facebook"
  | "google"
  | "microsoft"
  | "spotify"
  | "twitch"
  | "twitter"
  | "dropbox"
  | "linkedin"
  | "gitlab"
  | "tiktok"
  | "reddit"
  | "roblox"
  | "vk"
  | "kick"
  | "zoom";

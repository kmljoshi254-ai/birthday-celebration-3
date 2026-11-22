import { page1Config } from "./modules/page1";
import { page2Config } from "./modules/page2";
import { page3Config } from "./modules/page3";
import { page4Config } from "./modules/page4";
import { page5Config } from "./modules/page5";
import { page6Config } from "./modules/page6";

export interface MemoryPhoto {
  src: string;
  caption: string;
  rotation: number; // degrees
  date?: string;
  width?: number;
  height?: number;
}

export interface TimelineEvent {
  year: string;
  title: string;
  text: string;
  image: string;
  tag?: string;
}

export interface InsideJoke {
  question: string;
  answer: string;
  reaction: string;
}

export interface Award {
  title: string;
  text: string;
  icon: string;
  image?: string;
}

export interface FriendshipConfig {
  theme: string;
  recipient: string;
  sender: string;
  headerTextLeft: string;
  headerTextRight: string;
  bannerTitle: string;
  bannerSubtitle: string;
  envelopeMessage: string;
  envelopeButton: string;
  intro: {
    title: string;
    subtitle: string;
    openButton: string;
  };
  hero: {
    title: string;
    subtitle: string;
    annotation: string;
    footerLabel: string;
    swipeLabel: string;
    polaroids: MemoryPhoto[];
  };
  deskTitle: string;
  deskSubtitle: string;
  deskEnvelopeLabel: string;
  deskBoxLabel: string;
  timeline: TimelineEvent[];
  memories: MemoryPhoto[];
  insideJokes: InsideJoke[];
  awards: Award[];
  surprise: {
    title: string;
    prompt: string;
    revealText: string;
    images: string[];
  };
  desk: {
    mug: boolean;
    bracelet: boolean;
    flowers: string;
    pet: string;
    cassette: boolean;
    tickets: boolean;
  };
  letter: {
    greeting: string;
    body: string[];
    signoff: string;
  };
  page4: {
    recipient: string;
    openingLine: string;
    paragraphs: string[];
    signature: string;
    closingMessage: string;
  };
  page5: {
    title: string;
    question: {
      text: string;
    };
    challenge: {
      text: string;
    };
    futureNote: {
      text: string;
    };
    surprise: {
      message: string;
    };
    memory: {
      image: string;
      date: string;
      caption: string;
    };
  };
  page6: {
    heroMemoryIndex: number;
    instruction: string;
    caption: string;
    finalMessage: string;
    finalSubtext: string;
    signature: string;
  };
}

export const friendshipConfig: FriendshipConfig = {
  theme: page1Config.theme,
  recipient: page1Config.recipient,
  sender: page1Config.sender,
  desk: page1Config.desk,
  headerTextLeft: page1Config.headerTextLeft,
  headerTextRight: page1Config.headerTextRight,
  bannerTitle: page1Config.bannerTitle,
  bannerSubtitle: page1Config.bannerSubtitle,
  envelopeMessage: page1Config.envelopeMessage,
  envelopeButton: page1Config.envelopeButton,
  intro: page1Config.intro,
  hero: page2Config,
  deskTitle: page3Config.title,
  deskSubtitle: page3Config.subtitle,
  deskEnvelopeLabel: page3Config.envelopeLabel,
  deskBoxLabel: page3Config.boxLabel,
  timeline: page3Config.timeline,
  memories: page3Config.memories,
  insideJokes: page3Config.insideJokes,
  awards: page3Config.awards,
  surprise: page3Config.surprise,
  letter: {
    greeting: page4Config.greeting,
    body: page4Config.body,
    signoff: page4Config.signoff,
  },
  page4: page4Config.page4,
  page5: page5Config,
  page6: page6Config,
};

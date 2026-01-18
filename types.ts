import React from 'react';

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export enum AppRoute {
  HOME = '/',
  GAME_LUDO = '/game/ludo',
  FUTURE_SELF = '/future-self',
  SOCIAL_FEED = '/social',
  LOGIN = '/login',
  REGISTER = '/register',
  SETTINGS = '/settings',
  TRENDING = '/trending',
  PRICING = '/pricing',
  PAYMENT_SUCCESS = '/payment-success',
  ADMIN = '/admin-console',
  IMAGE_DASHBOARD = '/image-studio',
  VIDEO_TOOLS = '/video-studio',
  DOC_TOOLS = '/doc-intelligence',
  AI_ASSISTANT = '/ai-assistant', // New Route
  
  // Legal & Support
  PRIVACY = '/privacy-policy',
  TERMS = '/terms-of-service',
  ABOUT = '/about-us',
  CONTACT = '/contact-us',
}

// --- GAME TYPES ---
export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';
export type GameMode = 'ONLINE' | 'COMPUTER' | 'LOCAL';
export type GameState = 'MENU' | 'LOBBY' | 'PLAYING' | 'GAMEOVER';

export interface LudoRoom {
  roomId: string;
  hostId: string;
  players: {
    id: string;
    name: string;
    color: PlayerColor;
    isBot?: boolean;
    avatar?: string;
  }[];
  currentTurnIndex: number;
  entryFee: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
}

export interface LudoPawn {
  id: number;
  color: PlayerColor;
  state: 'HOME' | 'TRACK' | 'FINISHED';
  position: number; // 0-56
}

// --- SOCIAL TYPES ---
export interface SocialPost {
  id: string;
  author: string;
  avatarUrl: string;
  contentUrl: string;
  contentType: 'image' | 'video';
  caption: string;
  likes: number;
  comments: number;
  isAnime: boolean;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export type AnalysisAttribute = {
  label: string;
  value: string;
};

export type ImageCategory = 'FOOD' | 'DOCUMENT' | 'PLANT' | 'ANIMAL' | 'FACE' | 'UNKNOWN';

export interface AnalysisResult {
  category: ImageCategory;
  title: string;
  description: string;
  attributes: AnalysisAttribute[];
  confidence?: number;
}
import React from 'react';
import { AppRoute } from './types';

export const APP_NAME = "Aditi's AI";
export const ADMIN_EMAIL = "admin@aditis.ai"; // REGISTER WITH THIS EMAIL TO ACCESS ADMIN PANEL
export const BOOKS_LINK = "https://www.smartbiz.in/AnimeWonderlands";

// --- GAME ECONOMICS ---
export const GAME_CONFIG = {
  DAILY_REWARD: 250,
  STARTING_COINS: 500,
  BOT_DELAY: 1000,
  BET_TIERS: [
    { entry: 100, prize: 180 },
    { entry: 500, prize: 900 },
    { entry: 2500, prize: 4500 },
    { entry: 10000, prize: 18000 }
  ]
};

// --- GAME CONSTANTS ---
export const LUDO_COLORS = {
  RED: '#ef4444',
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  BLUE: '#3b82f6'
};

// --- IMAGE STUDIO PRESETS ---
export const IMAGE_STYLES = [
  { id: 'anime', label: 'Anime Style', prompt: 'in high-quality vibrant anime style, cel shaded, detailed' },
  { id: 'realistic', label: 'Photorealistic', prompt: 'hyper-realistic photography, 8k resolution, cinematic lighting, highly detailed' },
  { id: '3d', label: '3D Render', prompt: '3D blender render, isometric, cute, glossy, plastic texture' },
  { id: 'flat', label: 'Flat Illustration', prompt: 'modern flat vector illustration, minimal, clean lines, corporate memphis style' },
  { id: 'pixel', label: 'Game Asset (Pixel)', prompt: 'pixel art style, 16-bit game asset, isolated' },
  { id: 'fantasy', label: 'Fantasy Art', prompt: 'digital oil painting, fantasy concept art, intricate details, magical atmosphere' },
];

export const RESIZE_PRESETS = [
  { label: 'Instagram Square', w: 1080, h: 1080 },
  { label: 'Instagram Portrait', w: 1080, h: 1350 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'Twitter/X Post', w: 1600, h: 900 },
  { label: 'Website Hero', w: 1920, h: 1080 },
];

// --- MOCKUP CONFIGURATION ---
export const MOCKUP_TYPES = [
  { id: 'tshirt', label: 'T-Shirt', prompt: 'A high-quality cotton t-shirt' },
  { id: 'hoodie', label: 'Hoodie', prompt: 'A premium streetwear hoodie' },
  { id: 'mug', label: 'Coffee Mug', prompt: 'A ceramic coffee mug' },
  { id: 'phone', label: 'Phone Case', prompt: 'A modern smartphone case' },
  { id: 'tote', label: 'Tote Bag', prompt: 'A canvas tote bag' },
  { id: 'poster', label: 'Wall Art', prompt: 'A framed poster on a wall' },
  { id: 'packaging', label: 'Box Packaging', prompt: 'A cardboard product mailing box' },
  { id: 'cap', label: 'Baseball Cap', prompt: 'A structured baseball cap' }
];

export const MOCKUP_PLATFORMS = [
  { id: 'amazon', label: 'Amazon/Shopify', ratio: '1:1', prompt: 'Professional e-commerce photography, isolated on pure white background, shadow reflection, 1:1 aspect ratio, commercial quality.' },
  { id: 'instagram', label: 'Instagram Post', ratio: '4:5', prompt: 'Aesthetic social media lifestyle shot, trendy composition, 4:5 aspect ratio, high engagement style.' },
  { id: 'story', label: 'IG/TikTok Story', ratio: '9:16', prompt: 'Full screen vertical lifestyle photography, 9:16 aspect ratio, immersive, influencer style.' },
  { id: 'etsy', label: 'Etsy Listing', ratio: '4:3', prompt: 'Warm, handmade aesthetic, high key lighting, 4:3 aspect ratio, trustworthy seller vibe.' },
  { id: 'banner', label: 'Web Banner', ratio: '16:9', prompt: 'Wide cinematic product shot, negative space for text, 16:9 aspect ratio, website hero header.' }
];

export const MOCKUP_BACKGROUNDS = [
  { id: 'studio', label: 'Studio White', prompt: 'Clean white studio background, softbox lighting, minimalist.' },
  { id: 'lifestyle', label: 'Cozy Lifestyle', prompt: 'Placed on a wooden table in a sunlit coffee shop, depth of field, cozy vibes.' },
  { id: 'urban', label: 'Urban Street', prompt: 'Outdoors in a city environment, concrete textures, streetwear aesthetic.' },
  { id: 'nature', label: 'Nature/Outdoor', prompt: 'Soft natural sunlight, surrounded by greenery and nature, organic feel.' },
  { id: 'luxury', label: 'Dark Luxury', prompt: 'Dark moody lighting, silk textures, premium marble surface, elegant.' }
];

export const LOGO_STYLES = [
  { id: 'minimal', label: 'Minimalist', prompt: 'minimalist vector logo, simple geometric shapes, clean, monochrome' },
  { id: 'modern', label: 'Modern Tech', prompt: 'modern tech startup logo, gradient colors, futuristic font, sleek' },
  { id: 'mascot', label: 'Mascot', prompt: 'esports style mascot logo, bold outlines, vibrant colors, character based' },
  { id: 'vintage', label: 'Vintage/Retro', prompt: 'vintage badge style logo, textured, retro typography, seal' },
];

// --- AI PROMPTS ---
export const PROMPTS = {
  // FUTURE SELF CORE
  FUTURE_SELF_ANIME: `You are a legendary Anime Character Designer. 
  Take this user's photo and their life goals, and generate a "Future Self" portrait in a high-quality, cinematic Anime Style (think Studio Ghibli meets Cyberpunk).
  
  Guidelines:
  1. PRESERVE identity (hair color, eye shape) but idealize it.
  2. INCORPORATE their goals visually (e.g., if goal is "Doctor", show them in high-tech medical gear).
  3. STYLE: Vibrant, cel-shaded, 4k resolution.
  
  Context provided by user: `,

  // SOCIAL & CONTENT
  ANIME_CAPTION: "Generate 3 engaging, short, anime-community style captions for this image. Use Japanese kaomoji (e.g., (◕‿◕)) and trending hashtags like #AnimeLife #FutureSelf.",
  
  // AR/VIDEO
  TRANSFORMATION_VIDEO: "Generate a video of a magical girl/boy transformation sequence based on this character image. Cinematic lighting, particle effects, smooth motion.",
  
  // GAME ASSETS
  GENERATE_AVATAR: "Create a cute, chibi-style anime avatar based on this description: ",

  // --- NEW TOOLS PROMPTS ---
  CLASSIFY_IMAGE: "Analyze this image and return a JSON object with category (FOOD, DOCUMENT, PLANT, ANIMAL, FACE, UNKNOWN), title, description, and attributes.",
  AVATAR_BASE: "Create a high-quality avatar based on this image. Style:",
  THUMBNAIL_BASE: "Create a viral YouTube thumbnail based on this image. Style:",
  CAPTION: "Generate an engaging caption for this content.",
  ROAST_ME: "Roast this image in a funny, lighthearted way.",
  HEALTH_SCAN: "Analyze this image for health, diet, and safety implications. Output a structured response with: 1. Identification (What is it?), 2. Health/Nutritional Pros, 3. Cons or Safety Risks, 4. Final Verdict. Keep the format clean and categorized.",
  
  // VIDEO
  AD_UGC_BASE: "Create a UGC-style video ad script for this product.",
  AD_ANIMATED_BASE: "Create a 3D animated video ad concept for this product.",
  VIDEO_DEFAULT: "Generate a creative video based on this image.",
  
  // DOCS
  DOC_SUMMARIZE: "Summarize the key points of this document.",
  DOC_PLAGIARISM: "Analyze this text for potential plagiarism or AI generation patterns.",
  DOC_REWRITE: "Rewrite this text in a formal IEEE academic style.",
  
  // DOCS - GENERATORS
  DOC_PDF_GEN: `Create a comprehensive, professional report on the following topic. 
  Output strict HTML content using <h1>, <h2>, <p>, <ul>, <li> tags. 
  Use inline CSS for styling to make it look like a clean, modern white paper (font-family: Arial, line-height: 1.6). 
  Do not include markdown backticks or 'html' language tags, just the raw HTML body content.
  Include a Title Section, Introduction, Core Analysis (with subheaders), and Conclusion. 
  Topic: `,
  
  DOC_PPT_GEN: `Act as a Presentation Expert. Create a slide deck for the following topic. 
  Return ONLY a JSON array of slide objects.
  Each object must have: 
  - 'title' (string)
  - 'content' (array of strings, bullet points)
  - 'speakerNotes' (string)
  Do not use markdown formatting for the JSON. 
  Topic: `,

  // --- IMAGE STUDIO SPECIFIC ---
  SMART_ENHANCE: "Refine this prompt to be more descriptive, artistic, and effective for an image generation model. Keep it concise but add necessary details about lighting and composition. Prompt:",
  MOCKUP_BASE: "Create a photorealistic product mockup. Apply the design/logo provided (if any) naturally onto the product surface, respecting perspective, cloth folds, and lighting. The output must be ready for commercial use.",
  LOGO_BASE: "Design a professional logo. Ensure high contrast and vector-like quality. White background.",
  EDU_DIAGRAM: "Create a clear, high-quality educational diagram for a textbook. WHITE BACKGROUND. CRITICAL: Ensure all text labels are spelled correctly, are legible, and lines clearly point to parts. Diagram must be accurate and textbook quality. Topic:",

  // --- LUDO ASSET GENERATION ---
  LUDO_ASSET_BOARD: `Design a Ludo board (top-down view). 
  Style: Cute Indian-themed anime aesthetic. 
  Details: Clear red/blue/green/yellow sections. Subtle rangoli and mandala patterns in the background. Bright, clean, kid-friendly visuals. 
  Format: Isolated on transparent background, high contrast for mobile screens, 4K resolution.`,

  LUDO_ASSET_PAWN: `Design a set of Ludo pawns/tokens.
  Style: Chibi Indian anime style (resembling cute royal guards or traditional dolls).
  Colors: Generate one for Red, Green, Blue, and Yellow.
  Format: Isolated, transparent background, glossy mobile-game look.`,

  LUDO_ASSET_DICE: `Design a 3D game dice.
  Style: Indian cultural touch (gold accents, lotus motifs on faces).
  Format: Isolated, transparent background.`,

  LUDO_ASSET_CROWN: `Design a Crown icon for the winner.
  Style: Traditional Indian Maharaja headdress style but cute/chibi anime version. Gold with jewels.
  Format: Isolated, transparent background.`
};

export const SAMPLE_IMAGE = "https://picsum.photos/id/64/800/600"; 
export const SAMPLE_VIDEO_PROMPT = "A futuristic anime city with neon lights";

export const PRICING_LINK = "https://rzp.io/rzp/WonderlandsPro";
export const PRICING_LINK_YEARLY = "https://rzp.io/rzp/WonderlandsProYearly";
import myPhoto from "../assets/screenshot_20261018_185306_meskot.jpg";

export const ME = { name: "You", initials: "ME", photo: myPhoto };

export type Comment = { id: number; author: string; text: string };

export type Post = {
  id: number;
  author: string;
  initials: string;
  color: string;
  time: string;
  text: string;
  sponsored?: boolean;
  likes: number;
  liked: boolean;
  comments: Comment[];
};

export const initialPosts: Post[] = [
  {
    id: 1,
    author: "Hesam Yemane",
    initials: "HY",
    color: "bg-meskot-gold",
    time: "Sep 17 at 12:35 PM",
    text: "Sharing a moment with the people who matter most. Gratitude every day.",
    sponsored: true,
    likes: 128,
    liked: false,
    comments: [{ id: 1, author: "Ben Lee", text: "Beautiful, congrats!" }],
  },
  {
    id: 2,
    author: "Ava Johnson",
    initials: "AJ",
    color: "bg-meskot-rose",
    time: "2h",
    text: "Just finished my first marathon! Legs are jelly but my heart is full.",
    likes: 64,
    liked: false,
    comments: [],
  },
  {
    id: 3,
    author: "Marcus Chen",
    initials: "MC",
    color: "bg-meskot-sage",
    time: "5h",
    text: "Weekend hike was unreal. The view from the top made every step worth it.",
    likes: 210,
    liked: false,
    comments: [
      { id: 1, author: "Ava Johnson", text: "Looks amazing!" },
      { id: 2, author: "Priya Patel", text: "Where was this?" },
    ],
  },
];

export type Person = {
  id: number;
  name: string;
  initials: string;
  color: string;
  online: boolean;
  mutual: number;
};

export const initialFriends: Person[] = [
  { id: 1, name: "Ben Lee", initials: "BL", color: "bg-meskot-rose", online: true, mutual: 4 },
  { id: 2, name: "Sofia Rossi", initials: "SR", color: "bg-meskot-sage", online: true, mutual: 7 },
  { id: 3, name: "Liam Brown", initials: "LB", color: "bg-meskot-gold-deep", online: false, mutual: 2 },
];

export const initialRequests: Person[] = [
  { id: 11, name: "Priya Patel", initials: "PP", color: "bg-meskot-gold", online: false, mutual: 3 },
  { id: 12, name: "Noah Kim", initials: "NK", color: "bg-meskot-sage", online: true, mutual: 1 },
];

export const initialSuggestions: Person[] = [
  { id: 21, name: "Ava Johnson", initials: "AJ", color: "bg-meskot-rose", online: false, mutual: 5 },
  { id: 22, name: "Marcus Chen", initials: "MC", color: "bg-meskot-sage", online: true, mutual: 2 },
  { id: 23, name: "Emma Davis", initials: "ED", color: "bg-meskot-gold-deep", online: false, mutual: 6 },
];

export type Reel = {
  id: number;
  author: string;
  initials: string;
  caption: string;
  gradient: string;
  likes: number;
  liked: boolean;
  following: boolean;
};

export const initialReels: Reel[] = [
  {
    id: 1,
    author: "Ava Johnson",
    initials: "AJ",
    caption: "Sunrise run along the coast 🌅",
    gradient: "from-meskot-gold-deep via-meskot-rose to-meskot-ink",
    likes: 412,
    liked: false,
    following: false,
  },
  {
    id: 2,
    author: "Marcus Chen",
    initials: "MC",
    caption: "Trail life. Every summit earns its view.",
    gradient: "from-meskot-ink via-meskot-sage to-meskot-gold",
    likes: 958,
    liked: false,
    following: true,
  },
  {
    id: 3,
    author: "Sofia Rossi",
    initials: "SR",
    caption: "Cooking my grandmother's recipe today 🍝",
    gradient: "from-meskot-rose via-meskot-gold to-meskot-gold-deep",
    likes: 233,
    liked: false,
    following: false,
  },
];

export type MarketItem = {
  id: number;
  title: string;
  price: number;
  category: string;
  seller: string;
  color: string;
  saved: boolean;
};

export const MARKET_CATEGORIES = ["All", "Fashion", "Home", "Electronics", "Vehicles"];

export const initialMarket: MarketItem[] = [
  { id: 1, title: "Vintage leather jacket", price: 85, category: "Fashion", seller: "Ben Lee", color: "bg-meskot-gold-deep", saved: false },
  { id: 2, title: "Handmade ceramic vase", price: 40, category: "Home", seller: "Sofia Rossi", color: "bg-meskot-rose", saved: false },
  { id: 3, title: "Wireless headphones", price: 120, category: "Electronics", seller: "Liam Brown", color: "bg-meskot-sage", saved: true },
  { id: 4, title: "2015 mountain bike", price: 300, category: "Vehicles", seller: "Marcus Chen", color: "bg-meskot-ink", saved: false },
];

export type Alert = {
  id: number;
  kind: "friend" | "like" | "comment" | "market" | "system";
  text: string;
  time: string;
  read: boolean;
};

export const initialAlerts: Alert[] = [
  { id: 1, kind: "friend", text: "Priya Patel sent you a friend request", time: "10m", read: false },
  { id: 2, kind: "like", text: "Ava Johnson and 12 others liked your post", time: "1h", read: false },
  { id: 3, kind: "comment", text: "Ben Lee commented: Beautiful, congrats!", time: "3h", read: true },
  { id: 4, kind: "market", text: "Your saved item 'Wireless headphones' dropped in price", time: "1d", read: true },
  { id: 5, kind: "system", text: "Welcome to Meskot! Finish setting up your profile.", time: "2d", read: true },
];

export type Conversation = {
  id: number;
  name: string;
  initials: string;
  color: string;
  online: boolean;
  messages: { id: number; from: "me" | "them"; text: string }[];
};

export const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Ben Lee",
    initials: "BL",
    color: "bg-meskot-rose",
    online: true,
    messages: [
      { id: 1, from: "them", text: "Congrats on the new photo!" },
      { id: 2, from: "me", text: "Thanks Ben, appreciate it." },
    ],
  },
  {
    id: 2,
    name: "Sofia Rossi",
    initials: "SR",
    color: "bg-meskot-sage",
    online: true,
    messages: [{ id: 1, from: "them", text: "Are we still on for Saturday?" }],
  },
  {
    id: 3,
    name: "Liam Brown",
    initials: "LB",
    color: "bg-meskot-gold-deep",
    online: false,
    messages: [],
  },
];

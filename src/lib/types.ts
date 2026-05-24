export type Role = "owner" | "co-owner" | "devs" | "member";

export type User = {
  id: string;
  username: string;
  role: Role;
  avatar: string;
  status?: string;
  messages: number;
  reactionScore: number;
  joinedAt: string;
};

export type ForumCategory = {
  id: string;
  title: string;
  description: string;
  threads: number;
  posts: number;
  lastPost: {
    title: string;
    author: string;
    avatar: string;
    at: string;
  };
  icon: string;
};

export type ForumGroup = {
  id: string;
  name: string;
  categories: ForumCategory[];
};

export type ThreadStatus = "hot" | "pinned" | "solved" | "new" | "locked";

export type Thread = {
  id: string;
  title: string;
  author: User;
  category: string;
  replies: number;
  views: number;
  lastReplyAt: string;
  status?: ThreadStatus[];
  excerpt: string;
};

export type TicketStatus = "open" | "answered" | "pending" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export type TicketCategory =
  | "Valorant Support"
  | "Loader Issues"
  | "Purchase Help"
  | "Technical Support"
  | "Account Support";

export type Ticket = {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  author: User;
  replies: number;
  createdAt: string;
  updatedAt: string;
  excerpt: string;
};

export type AlertItem = {
  id: string;
  type: "reply" | "reaction" | "mention" | "system";
  user?: User;
  text: string;
  at: string;
  unread: boolean;
};

export type Conversation = {
  id: string;
  with: User;
  preview: string;
  at: string;
  unread: boolean;
};

export type ShoutMessage = {
  id: string;
  user: User;
  text: string;
  at: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  type: "release" | "hotfix" | "patch";
  notes: string[];
};

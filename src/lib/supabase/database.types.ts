export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = "owner" | "co-owner" | "devs" | "member";
export type TicketStatus = "open" | "answered" | "pending" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketCategory =
  | "Valorant Support"
  | "Loader Issues"
  | "Purchase Help"
  | "Technical Support"
  | "Account Support";
export type AlertKind = "reply" | "reaction" | "mention" | "message" | "system";
export type ReleaseKind = "release" | "hotfix" | "patch";

type TableShape<R, I = R, U = Partial<R>> = {
  Row: R;
  Insert: I;
  Update: U;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableShape<
        {
          id: string;
          username: string;
          role: Role;
          avatar_url: string | null;
          status: string | null;
          messages: number;
          reaction_score: number;
          invited_by: string | null;
          joined_at: string;
          subscribed: boolean;
        },
        {
          id: string;
          username: string;
          role?: Role;
          avatar_url?: string | null;
          status?: string | null;
          messages?: number;
          reaction_score?: number;
          invited_by?: string | null;
          joined_at?: string;
          subscribed?: boolean;
        }
      >;
      invite_codes: TableShape<
        {
          code: string;
          created_by: string;
          used_by: string | null;
          used_at: string | null;
          expires_at: string | null;
          created_at: string;
          note: string | null;
        },
        {
          code: string;
          created_by: string;
          used_by?: string | null;
          used_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          note?: string | null;
        }
      >;
      forum_groups: TableShape<{
        id: string;
        name: string;
        position: number;
        created_at: string;
      }>;
      forum_categories: TableShape<{
        id: string;
        group_id: string;
        title: string;
        description: string | null;
        icon: string | null;
        position: number;
        staff_only: boolean;
        created_at: string;
      }>;
      threads: TableShape<
        {
          id: string;
          category_id: string;
          author_id: string;
          title: string;
          body: string;
          pinned: boolean;
          locked: boolean;
          views: number;
          reply_count: number;
          last_reply_at: string;
          last_reply_user_id: string | null;
          created_at: string;
        },
        {
          category_id: string;
          author_id: string;
          title: string;
          body: string;
          pinned?: boolean;
          locked?: boolean;
        }
      >;
      posts: TableShape<
        {
          id: string;
          thread_id: string;
          author_id: string;
          body: string;
          edited_at: string | null;
          created_at: string;
        },
        {
          thread_id: string;
          author_id: string;
          body: string;
        }
      >;
      reactions: TableShape<
        {
          id: string;
          user_id: string;
          target_type: "thread" | "post";
          target_id: string;
          emoji: string;
          created_at: string;
        },
        {
          user_id: string;
          target_type: "thread" | "post";
          target_id: string;
          emoji?: string;
        }
      >;
      bookmarks: TableShape<
        {
          id: string;
          user_id: string;
          thread_id: string;
          created_at: string;
        },
        { user_id: string; thread_id: string }
      >;
      tickets: TableShape<
        {
          id: string;
          ref: string;
          author_id: string;
          subject: string;
          body: string;
          category: TicketCategory;
          priority: TicketPriority;
          status: TicketStatus;
          reply_count: number;
          last_reply_at: string;
          created_at: string;
          updated_at: string;
        },
        {
          author_id: string;
          subject: string;
          body: string;
          category: TicketCategory;
          priority?: TicketPriority;
          status?: TicketStatus;
        }
      >;
      ticket_replies: TableShape<
        {
          id: string;
          ticket_id: string;
          author_id: string;
          body: string;
          staff_note: boolean;
          created_at: string;
        },
        {
          ticket_id: string;
          author_id: string;
          body: string;
          staff_note?: boolean;
        }
      >;
      conversations: TableShape<{
        id: string;
        created_at: string;
        last_message_at: string;
      }>;
      conversation_participants: TableShape<
        {
          conversation_id: string;
          user_id: string;
          joined_at: string;
          last_read_at: string | null;
        },
        { conversation_id: string; user_id: string }
      >;
      messages: TableShape<
        {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        },
        { conversation_id: string; sender_id: string; body: string }
      >;
      alerts: TableShape<
        {
          id: string;
          recipient_id: string;
          actor_id: string | null;
          kind: AlertKind;
          text: string;
          link: string | null;
          read_at: string | null;
          created_at: string;
        },
        {
          recipient_id: string;
          actor_id?: string | null;
          kind: AlertKind;
          text: string;
          link?: string | null;
        }
      >;
      alert_preferences: TableShape<
        {
          user_id: string;
          email_replies: boolean;
          email_mentions: boolean;
          email_messages: boolean;
          push_replies: boolean;
          push_reactions: boolean;
          push_mentions: boolean;
          push_messages: boolean;
          updated_at: string;
        },
        {
          user_id: string;
          email_replies?: boolean;
          email_mentions?: boolean;
          email_messages?: boolean;
          push_replies?: boolean;
          push_reactions?: boolean;
          push_mentions?: boolean;
          push_messages?: boolean;
        }
      >;
      shouts: TableShape<
        {
          id: string;
          user_id: string;
          body: string;
          created_at: string;
        },
        { user_id: string; body: string }
      >;
      releases: TableShape<
        {
          id: string;
          version: string;
          kind: ReleaseKind;
          released_at: string;
          notes: string[];
          download_url: string | null;
          checksum: string | null;
          published: boolean;
          created_by: string | null;
          created_at: string;
        },
        {
          version: string;
          kind?: ReleaseKind;
          released_at?: string;
          notes?: string[];
          download_url?: string | null;
          checksum?: string | null;
          published?: boolean;
          created_by?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      consume_invite: {
        Args: {
          p_user_id: string;
          p_username: string;
          p_invite_code: string;
          p_avatar_url?: string | null;
        };
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
      increment_thread_views: {
        Args: { p_thread_id: string };
        Returns: void;
      };
      open_conversation: {
        Args: { p_with: string };
        Returns: string;
      };
      mark_conversation_read: {
        Args: { p_conversation: string };
        Returns: void;
      };
      set_role: {
        Args: { p_target: string; p_role: Role };
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
      list_profiles_for_admin: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string | null };
        Returns: Database["public"]["Tables"]["profiles"]["Row"][];
      };
      set_subscription: {
        Args: { p_target: string; p_subscribed: boolean };
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
      forum_stats: {
        Args: Record<string, never>;
        Returns: {
          threads: number;
          posts: number;
          members: number;
          latest_member_username: string | null;
          latest_member_joined_at: string | null;
        }[];
      };
      is_conversation_member: {
        Args: { p_conversation: string; p_user: string };
        Returns: boolean;
      };
      delete_self_account: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      arnhemia_role: Role;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      ticket_category: TicketCategory;
      alert_kind: AlertKind;
      release_kind: ReleaseKind;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type InviteCode = Database["public"]["Tables"]["invite_codes"]["Row"];
export type Thread = Database["public"]["Tables"]["threads"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type TicketReply = Database["public"]["Tables"]["ticket_replies"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];
export type ForumCategoryRow =
  Database["public"]["Tables"]["forum_categories"]["Row"];
export type ForumGroupRow =
  Database["public"]["Tables"]["forum_groups"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type ShoutRow = Database["public"]["Tables"]["shouts"]["Row"];
export type ReleaseRow = Database["public"]["Tables"]["releases"]["Row"];

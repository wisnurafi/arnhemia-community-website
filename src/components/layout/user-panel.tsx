"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RoleBadge } from "@/components/brand/role-badge";
import { formatNumber, initials } from "@/lib/utils";
import {
  User,
  MessageCircle,
  Bookmark,
  Settings,
  LifeBuoy,
  LogOut,
  Heart,
  PencilLine,
  ShieldCheck,
  Upload,
} from "lucide-react";
import type { Profile } from "@/lib/supabase/database.types";
import { logoutAction } from "@/app/(auth)/actions";
import { canInvite, isStaff } from "@/lib/roles";

export function UserPanel({ profile }: { profile: Profile }) {
  const avatarUrl =
    profile.avatar_url ??
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.username)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] py-1 pl-1 pr-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.04]">
          <Avatar className="size-7">
            <AvatarImage src={avatarUrl} alt={profile.username} />
            <AvatarFallback>{initials(profile.username)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-[13px] font-medium text-foreground/90 sm:inline">
            {profile.username}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] p-0">
        <div className="relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
          <div className="relative flex items-center gap-3 p-4">
            <div className="relative">
              <Avatar className="size-12 ring-2 ring-white/10">
                <AvatarImage src={avatarUrl} alt={profile.username} />
                <AvatarFallback>{initials(profile.username)}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-popover" />
            </div>
            <div className="min-w-0">
              <Link
                href={`/u/${profile.username}`}
                className="text-sm font-semibold tracking-wide hover:underline"
              >
                {profile.username}
              </Link>
              <div className="mt-1">
                <RoleBadge role={profile.role} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/[0.04] mx-3 rounded-lg overflow-hidden">
            <div className="bg-popover px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Messages
              </div>
              <div className="mt-0.5 text-sm font-semibold">
                {formatNumber(profile.messages)}
              </div>
            </div>
            <div className="bg-popover px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Reactions
              </div>
              <div className="mt-0.5 text-sm font-semibold flex items-center gap-1">
                <Heart className="size-3 text-rose-300" />
                {formatNumber(profile.reaction_score)}
              </div>
            </div>
          </div>

          <div className="m-3 mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <PencilLine className="size-3" />
              Status
            </div>
            <div className="relative mt-1.5">
              <Input
                defaultValue={profile.status ?? ""}
                placeholder="What's happening?"
                className="h-8 text-[12.5px]"
              />
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="p-1.5">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/u/${profile.username}`}>
              <User /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/conversations">
              <MessageCircle /> Conversations
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/bookmarks">
              <Bookmark /> Bookmarks
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings /> Preferences
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/tickets">
              <LifeBuoy /> Support tickets
            </Link>
          </DropdownMenuItem>

          {canInvite(profile.role) && (
            <DropdownMenuItem asChild>
              <Link href="/admin/invites">
                <ShieldCheck /> Invite codes
              </Link>
            </DropdownMenuItem>
          )}

          {isStaff(profile.role) && (
            <DropdownMenuItem asChild>
              <Link href="/admin/releases">
                <Upload /> Releases
              </Link>
            </DropdownMenuItem>
          )}

          {(profile.role === "owner" || profile.role === "co-owner") && (
            <DropdownMenuItem asChild>
              <Link href="/admin/members">
                <ShieldCheck /> Manage members
              </Link>
            </DropdownMenuItem>
          )}

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-red-300/90 outline-none transition-colors hover:bg-red-500/[0.08] hover:text-red-200"
            >
              <LogOut className="size-4 text-red-300/80" /> Logout
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

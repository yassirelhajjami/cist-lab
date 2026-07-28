"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { dbService } from "@/lib/db";
import type { Badge, Course, Mission, StudentProgress } from "@/types";
import { getXpProgress } from "@/components/layout/Navbar";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { BADGE_TIER_ORDER } from "@/lib/db/badge-requirements";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Compass,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { GameIcon, GameIconName } from "@/components/ui/GameIcon";

const AVATAR_LOOKS = [
  {
    id: "explorer",
    name: "Code Explorer",
    image: "/avatar-studio/explorer.png",
    price: 0,
    rarity: "Starter",
    categories: ["Starter"],
  },
  {
    id: "streetwear",
    name: "Pixel Streetwear",
    image: "/avatar-studio/pixel-streetwear.png",
    price: 1500,
    rarity: "Common",
    categories: ["Hats", "T-shirts"],
  },
  {
    id: "space",
    name: "Space Explorer",
    image: "/avatar-studio/space-explorer.png",
    price: 2500,
    rarity: "Rare",
    categories: ["Outfits"],
  },
  {
    id: "champion",
    name: "Code Champion",
    image: "/avatar-studio/code-champion.png",
    price: 4000,
    rarity: "Rare",
    categories: ["Hats", "T-shirts"],
  },
  {
    id: "inventor",
    name: "Junior Inventor",
    image: "/avatar-studio/junior-inventor.png",
    price: 6000,
    rarity: "Epic",
    categories: ["Hats", "Outfits"],
  },
  {
    id: "wizard",
    name: "Code Wizard",
    image: "/avatar-studio/code-wizard.png",
    price: 9000,
    rarity: "Epic",
    categories: ["Hats", "Outfits", "Premium"],
  },
  {
    id: "cyber",
    name: "Cyber Ninja",
    image: "/avatar-studio/cyber-ninja.png",
    price: 15000,
    rarity: "Legendary",
    categories: ["Outfits", "Premium"],
  },
  {
    id: "dragon",
    name: "Dragon Coder",
    image: "/avatar-studio/dragon-coder.png",
    price: 25000,
    rarity: "Mythic",
    categories: ["Hats", "Outfits", "Premium"],
  },
  {
    id: "galaxy",
    name: "Galaxy Architect",
    image: "/avatar-studio/galaxy-architect.png",
    price: 50000,
    rarity: "Celestial",
    categories: ["Hats", "Outfits", "Premium"],
  },
] as const;

const AVATAR_CATEGORIES = [
  "All",
  "Hats",
  "T-shirts",
  "Outfits",
  "Premium",
] as const;

const quickAdventures = [
  {
    href: "/scratch",
    title: "Block Jungle",
    note: "Create with colorful blocks",
    icon: "palette" as GameIconName,
    color: "bg-violet-100 border-violet-200",
  },
  {
    href: "/games",
    title: "Puzzle Temple",
    note: "Train your logic powers",
    icon: "condition" as GameIconName,
    color: "bg-amber-100 border-amber-200",
  },
  {
    href: "/code-lab",
    title: "Code Workshop",
    note: "Build something amazing",
    icon: "monitor" as GameIconName,
    color: "bg-sky-100 border-sky-200",
  },
];

export default function StudentDashboard() {
  const { profile, student, notifications, refreshUser, loginStreak } =
    useApp();
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [badgesCount, setBadgesCount] = useState(0);
  const [highestBadge, setHighestBadge] = useState<Badge | null>(null);
  const [leaderboardPos, setLeaderboardPos] = useState<number | string>("-");
  const [ownedLooks, setOwnedLooks] = useState<string[]>(["explorer"]);
  const [equippedLook, setEquippedLook] = useState("explorer");
  const [studioMessage, setStudioMessage] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [avatarCategory, setAvatarCategory] =
    useState<(typeof AVATAR_CATEGORIES)[number]>("All");

  useEffect(() => {
    async function loadDashboardData() {
      if (!profile || !student) return;
      const [earnedBadges, allMissions, courses, progress, board] = await Promise.all([
        dbService.getStudentBadges(student.id),
        dbService.getMissions(),
        dbService.getCourses(),
        dbService.getStudentProgress(student.id),
        dbService.getLeaderboard(),
      ]);
      const completedMissionIds = progress
        .filter(
          (item: StudentProgress) =>
            !item.lesson_id &&
            !item.challenge_id &&
            item.status === "completed",
        )
        .map((item: StudentProgress) => item.mission_id);
      const courseIds = courses
        .filter((course: Course) => course.grade === student.grade)
        .map((course: Course) => course.id);
      const gradeMissions = allMissions.filter(
        (mission: Mission) =>
          courseIds.includes(mission.course_id || "") && mission.is_published,
      );
      setActiveMission(
        gradeMissions.find(
          (mission: Mission) => !completedMissionIds.includes(mission.id),
        ) ||
          gradeMissions[0] ||
          null,
      );
      setBadgesCount(earnedBadges.length);
      setHighestBadge(
        [...earnedBadges].sort(
          (a, b) =>
            BADGE_TIER_ORDER.indexOf(b.name) - BADGE_TIER_ORDER.indexOf(a.name),
        )[0] ?? null,
      );
      const position = board.findIndex(
        (item: { id: string }) => item.id === student.id,
      );
      setLeaderboardPos(position >= 0 ? position + 1 : "—");
    }
    loadDashboardData().catch(console.error);
  }, [profile, student]);

  useEffect(() => {
    if (!student) return;
    const frame = window.requestAnimationFrame(() => {
      const savedOwned = localStorage.getItem(`cist_avatar_owned_${student.id}`);
      const savedEquipped = localStorage.getItem(
        `cist_avatar_equipped_${student.id}`,
      );
      if (savedOwned) {
        try {
          setOwnedLooks(
            Array.from(new Set(["explorer", ...JSON.parse(savedOwned)])),
          );
        } catch {
          /* keep starter look */
        }
      }
      if (savedEquipped && AVATAR_LOOKS.some((look) => look.id === savedEquipped))
        setEquippedLook(savedEquipped);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [student]);

  if (!profile || !student) return null;

  const xpInfo = getXpProgress(profile.xp);
  const firstName = profile.full_name.split(" ")[0];
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleEquipLook = async (lookId: string) => {
    const look = AVATAR_LOOKS.find((item) => item.id === lookId);
    if (!look || !ownedLooks.includes(lookId)) return;
    setEquippedLook(lookId);
    localStorage.setItem(`cist_avatar_equipped_${student.id}`, lookId);
    await dbService.updateStudent(profile.id, { avatar_url: look.image }, {});
    await refreshUser();
    setStudioMessage(`${look.name} equipped!`);
  };

  const handleBuyLook = async (lookId: string) => {
    const look = AVATAR_LOOKS.find((item) => item.id === lookId);
    if (!look || ownedLooks.includes(lookId) || isBuying) return;
    if (profile.coins < look.price) {
      setStudioMessage(
        `You need ${look.price - profile.coins} more coins for ${look.name}.`,
      );
      return;
    }
    setIsBuying(true);
    setStudioMessage("");
    try {
      await dbService.updateXPAndCoins(
        profile.id,
        0,
        -look.price,
        `Purchased avatar look: ${look.name}`,
      );
      const nextOwned = [...ownedLooks, look.id];
      setOwnedLooks(nextOwned);
      localStorage.setItem(
        `cist_avatar_owned_${student.id}`,
        JSON.stringify(nextOwned),
      );
      await refreshUser();
      setStudioMessage(`${look.name} added to your closet!`);
    } catch {
      setStudioMessage(
        "The shop could not complete that purchase. Please try again.",
      );
    } finally {
      setIsBuying(false);
    }
  };

  const activeLook =
    AVATAR_LOOKS.find((look) => look.id === equippedLook) ?? AVATAR_LOOKS[0];
  const filteredAvatarLooks =
    avatarCategory === "All"
      ? AVATAR_LOOKS
      : AVATAR_LOOKS.filter((look) =>
          (look.categories as readonly string[]).includes(avatarCategory),
        );

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-900/10 bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-yellow-300/20" />
        <div className="absolute right-12 bottom-[-6rem] h-48 w-48 rounded-full border-[28px] border-white/5" />
        <div className="absolute left-1/2 top-5 text-5xl opacity-15 rotate-12">
          {"</>"}
        </div>
        <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <button
              onClick={() => setAvatarOpen(true)}
              className="group relative mx-auto shrink-0 sm:mx-0"
              aria-label="Change your explorer avatar"
            >
              <div className="rounded-[1.7rem] bg-yellow-300 p-1.5 shadow-xl rotate-[-2deg] transition group-hover:rotate-2 group-hover:scale-105">
                <div className="h-24 w-24 overflow-hidden rounded-[1.3rem] bg-gradient-to-b from-sky-100 to-emerald-100">
                  <Image
                    src={activeLook.image}
                    alt={`Your ${activeLook.name} avatar`}
                    width={96}
                    height={96}
                    className="h-full w-full translate-y-[34%] scale-[1.95] object-contain object-top"
                  />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-sky-500 shadow-lg">
                <Camera className="h-4 w-4" />
              </span>
            </button>
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-yellow-200">
                <Compass className="h-3.5 w-3.5" /> Explorer basecamp
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                Ready for an adventure, {firstName}?
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-emerald-50/85">
                Your next coding quest is waiting. Solve puzzles, collect stars,
                and build your way to the top!
              </p>
            </div>
          </div>
          <div className="mx-auto flex gap-2 lg:mx-0">
            {highestBadge && (
              <Link
                href="/badges"
                className="flex min-w-28 items-center gap-2 rounded-2xl border border-yellow-200/50 bg-yellow-300/15 px-3 py-2 text-left shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300/25"
              >
                <BadgeIcon
                  name={highestBadge.icon_url}
                  className="h-12 w-12 shrink-0"
                />
                <span>
                  <b className="block text-[10px] uppercase tracking-wider text-yellow-200">
                    Equipped badge
                  </b>
                  <span className="block max-w-24 text-xs font-black leading-tight text-white">
                    {highestBadge.name}
                  </span>
                </span>
              </Link>
            )}
            <div className="rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-center">
              <GameIcon name="xp" className="mx-auto h-9 w-9" />
              <b className="mt-1 block text-lg">{loginStreak}</b>
              <span className="text-[9px] font-black uppercase tracking-wider text-white/65">
                day streak
              </span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-center">
              <GameIcon name="trophy" className="mx-auto h-9 w-9" />
              <b className="mt-1 block text-lg">{profile.level}</b>
              <span className="text-[9px] font-black uppercase tracking-wider text-white/65">
                level
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Adventure level",
            value: `Level ${profile.level}`,
            note: profile.rank_title,
            icon: "trophy" as GameIconName,
            style: "bg-yellow-100",
          },
          {
            label: "Treasure coins",
            value: profile.coins.toLocaleString(),
            note: "Spend on cool rewards",
            icon: "coin" as GameIconName,
            style: "bg-orange-100",
          },
          {
            label: "Explorer rank",
            value: `#${leaderboardPos}`,
            note: "On the school leaderboard",
            icon: "crown" as GameIconName,
            style: "bg-rose-100",
          },
          {
            label: "Badges found",
            value: badgesCount.toString(),
            note: "Keep collecting!",
            icon: "gem" as GameIconName,
            style: "bg-violet-100",
          },
        ].map(({ label, value, note, icon, style }) => (
          <article
            key={label}
            className="quest-card quest-card-hover flex items-center gap-4 p-4.5"
          >
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${style}`}
            >
              <GameIcon name={icon} className="h-14 w-14 drop-shadow-md" />
            </div>
            <div>
              <span className="quest-kicker">{label}</span>
              <strong className="mt-0.5 block text-2xl font-black text-slate-900">
                {value}
              </strong>
              <span className="text-[11px] font-semibold text-slate-500">
                {note}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <article className="quest-card overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-emerald-50 px-5 py-4 md:px-6">
            <div>
              <span className="quest-kicker">Continue your journey</span>
              <h3 className="text-xl font-black text-slate-900">
                Your next quest
              </h3>
            </div>
            <Link
              href="/missions"
              className="flex items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-900"
            >
              Quest map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {activeMission ? (
            <div className="p-5 md:p-6">
              <div className="rounded-[1.5rem] border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-emerald-50 p-5 md:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        {activeMission.category}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-emerald-700">
                        {activeMission.difficulty}
                      </span>
                    </div>
                    <h4 className="mt-4 text-2xl font-black text-slate-900">
                      {activeMission.title}
                    </h4>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
                      {activeMission.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-amber-600 shadow-sm">
                      <GameIcon name="xp" className="h-5 w-5" />{" "}
                      {activeMission.xp_reward} XP
                    </span>
                    <span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-orange-600 shadow-sm">
                      <GameIcon name="coin" className="h-5 w-5" />{" "}
                      {activeMission.coin_reward}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-4 border-t-2 border-white/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" /> Complete activities to
                    unlock rewards
                  </div>
                  <Link
                    href={`/missions/${activeMission.id}`}
                    className="quest-button flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg"
                  >
                    Start quest <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="quest-progress h-4 flex-1">
                  <div
                    className="h-full"
                    style={{ width: `${xpInfo.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-black text-emerald-800">
                  {xpInfo.percentage}% to level {profile.level + 1}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <GameIcon name="trophy" className="mx-auto h-20 w-20" />
              <h4 className="mt-3 text-xl font-black">All quests conquered!</h4>
              <p className="mt-1 text-sm text-slate-500">
                Visit the workshop and create something new.
              </p>
            </div>
          )}
        </article>

        <article className="quest-card p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="quest-kicker">Pick a side adventure</span>
              <h3 className="text-xl font-black text-slate-900">
                Explore & play
              </h3>
            </div>
            <GameIcon name="flag" className="h-11 w-11" />
          </div>
          <div className="mt-5 space-y-3">
            {quickAdventures.map(({ href, title, note, icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${color}`}
                >
                  <GameIcon name={icon} className="h-10 w-10" />
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block text-sm font-black text-slate-800">
                    {title}
                  </b>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {note}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600" />
              </Link>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
            <GameIcon name="sparkle" className="h-7 w-7 shrink-0" />
            Try one small challenge every day to keep your streak alive.
          </div>
        </article>
      </section>

      <section className="quest-card p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="quest-kicker">Messages from your world</span>
            <h3 className="text-xl font-black text-slate-900">
              Latest quest news
            </h3>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black text-rose-700">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {notifications.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-slate-50 py-8 text-center text-sm font-semibold text-slate-400">
              Your adventure log is quiet—for now!
            </div>
          ) : (
            notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4"
              >
                <GameIcon name="bell" className="h-9 w-9" />
                <b className="mt-3 block text-sm text-slate-800">
                  {notification.title}
                </b>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {notification.message}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {avatarOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-title"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border-2 border-emerald-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-emerald-100 bg-gradient-to-r from-emerald-700 to-sky-700 px-6 py-4 text-white">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[.2em] text-yellow-200">
                  Avatar Studio
                </span>
                <h3 id="avatar-title" className="text-2xl font-black">
                  Build your explorer
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-black">
                  <GameIcon name="coin" className="h-7 w-7" />{" "}
                  {profile.coins.toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    setAvatarOpen(false);
                    setStudioMessage("");
                  }}
                  className="rounded-xl bg-white/15 p-2 hover:bg-white/25"
                  aria-label="Close Avatar Studio"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="grid lg:grid-cols-[.85fr_1.4fr]">
              <section className="relative flex min-h-[500px] flex-col items-center justify-end overflow-hidden bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-100 p-6">
                <div className="absolute left-8 top-8 h-16 w-28 rounded-full bg-white/70 blur-sm" />
                <div className="absolute right-6 top-24 h-10 w-20 rounded-full bg-white/60 blur-sm" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-emerald-200/60" />
                <Image
                  src={activeLook.image}
                  alt={`${activeLook.name} full body preview`}
                  width={420}
                  height={420}
                  className="relative z-10 h-[420px] w-full object-contain drop-shadow-2xl"
                />
                <div className="relative z-10 mt-[-8px] rounded-full bg-slate-900 px-5 py-2 text-center text-white shadow-lg">
                  <b className="block text-sm">{activeLook.name}</b>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300">
                    Currently equipped
                  </span>
                </div>
              </section>
              <section className="max-h-[600px] overflow-y-auto p-5 md:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="quest-kicker">Closet & shop</span>
                    <h4 className="text-2xl font-black text-slate-900">
                      Choose your look
                    </h4>
                  </div>
                  <ShoppingBag className="h-9 w-9 text-emerald-600" />
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Spend Treasure Coins on permanent outfits, then switch between
                  owned looks anytime.
                </p>
                {studioMessage && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                    {studioMessage}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {AVATAR_CATEGORIES.map((category) => {
                    const count = category === "All"
                      ? AVATAR_LOOKS.length
                      : AVATAR_LOOKS.filter((look) =>
                          (look.categories as readonly string[]).includes(category),
                        ).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setAvatarCategory(category)}
                        className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ${avatarCategory === category ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
                      >
                        {category} <span className="opacity-65">{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {filteredAvatarLooks.map((look) => {
                    const owned = ownedLooks.includes(look.id);
                    const equipped = equippedLook === look.id;
                    return (
                      <article
                        key={look.id}
                        className={`overflow-hidden rounded-2xl border-2 p-3 transition ${equipped ? "border-emerald-500 bg-emerald-50 shadow-lg" : "border-slate-100 bg-slate-50 hover:border-sky-200"}`}
                      >
                        <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-emerald-100">
                          <Image
                            src={look.image}
                            alt={look.name}
                            width={320}
                            height={320}
                            className="h-full w-full object-contain"
                          />
                          <span className="absolute left-2 top-2 rounded-full bg-slate-900/85 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-yellow-200">
                            {look.rarity}
                          </span>
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-2">
                          <div>
                            <b className="block text-sm text-slate-900">
                              {look.name}
                            </b>
                            <span className="flex items-center gap-1 text-xs font-black text-amber-600">
                              {look.price === 0 ? (
                                "Free starter"
                              ) : (
                                <>
                                  <GameIcon name="coin" className="h-5 w-5" />{" "}
                                  {look.price}
                                </>
                              )}
                            </span>
                          </div>
                          {equipped ? (
                            <span className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase text-white">
                              Equipped
                            </span>
                          ) : owned ? (
                            <button
                              onClick={() => handleEquipLook(look.id)}
                              className="rounded-xl bg-sky-600 px-3 py-2 text-[10px] font-black uppercase text-white hover:bg-sky-700"
                            >
                              Equip
                            </button>
                          ) : (
                            <button
                              disabled={isBuying}
                              onClick={() => handleBuyLook(look.id)}
                              className="rounded-xl bg-amber-400 px-3 py-2 text-[10px] font-black uppercase text-amber-950 hover:bg-amber-300 disabled:opacity-50"
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-2xl bg-violet-50 p-4 text-xs font-semibold text-violet-900">
                  <Sparkles className="h-5 w-5 shrink-0 text-violet-600" />
                  All purchased looks stay in your closet permanently on this
                  device.
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

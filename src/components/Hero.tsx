"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/lib/i18n";
import { countProducts, formatCount, formatPrice } from "@/lib/format";
import { sourceMeta } from "@/lib/site";
import type { Source } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export type HeroShot = {
  src: string;
  alt: string;
  href: string;
  label: string;
  price: number | null;
  source: Source;
};

export function Hero({
  techCount,
  homeCount,
  shots,
}: {
  techCount: number;
  homeCount: number;
  shots: HeroShot[];
}) {
  const { dict } = useLocale();

  return (
    <section className="relative flex min-h-0 flex-1 overflow-hidden">
      <Image
        src="/logo-mark.png"
        alt=""
        aria-hidden
        width={1774}
        height={887}
        priority
        className="pointer-events-none absolute left-0 top-1/2 w-[min(680px,72vw)] max-w-none -translate-y-1/2 select-none opacity-50 blur-md"
      />
      <div className="shell relative z-10 grid min-h-0 flex-1 items-center gap-8 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:py-8">
        <div>
          <motion.h1
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="max-w-xl font-display text-4xl leading-[0.95] sm:text-5xl md:text-6xl xl:text-7xl"
          >
            {dict.hero.title}
          </motion.h1>
          <motion.p
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="mt-4 max-w-xl text-base leading-7 text-ink/70 sm:mt-6 sm:text-lg sm:leading-8"
          >
            {fill(dict.hero.subtitle, { tech: formatCount(techCount), home: formatCount(homeCount) })}
          </motion.p>
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
            <Portal
              href="/tehnologija"
              kicker="Treco"
              title={dict.nav.technology}
              text={countProducts(techCount, dict)}
              tone="tech"
            />
            <Portal
              href="/dom"
              kicker="Tremark"
              title={dict.nav.home}
              text={countProducts(homeCount, dict)}
              tone="home"
            />
          </div>
        </div>

        <div className="w-full max-w-md self-center lg:max-w-lg">
          <HeroSlideshow shots={shots} fromCatalog={dict.hero.fromCatalog} />
        </div>
      </div>
    </section>
  );
}

function shuffle<T>(items: readonly T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap] as T;
    copy[swap] = current as T;
  }
  return copy;
}

function HeroSlideshow({ shots, fromCatalog }: { shots: HeroShot[]; fromCatalog: string }) {
  const { dict, locale } = useLocale();
  const [deck, setDeck] = useState<HeroShot[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const shot = deck[index];

  useEffect(() => {
    setDeck(shuffle(shots).slice(0, 8));
    setIndex(0);
  }, [shots]);

  useEffect(() => {
    if (paused || deck.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % deck.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, deck]);

  if (!shot) {
    return <div className="rounded-[2rem] border border-ink/10 bg-card p-5 shadow-lift sm:p-6" aria-hidden />;
  }

  const meta = sourceMeta[shot.source];
  const go = (step: number) => setIndex((current) => (current + step + deck.length) % deck.length);

  return (
    <div
      className="rounded-[2rem] border border-ink/10 bg-card p-5 shadow-lift sm:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tech">{fromCatalog}</p>
        <p className={meta.tone === "tech" ? "text-xs font-semibold text-tech" : "text-xs font-semibold text-home"}>
          {meta.brand}
        </p>
      </div>

      <Link href={shot.href} className="mt-4 block">
        <div className="flex h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={shot.src} src={shot.src} alt={shot.alt} className="max-h-full max-w-full object-contain p-3" />
        </div>
        <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 sm:text-base">{shot.label}</p>
        <p className="mt-1 font-display text-xl">{formatPrice(shot.price, locale, dict)}</p>
      </Link>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {deck.map((item, itemIndex) => (
            <button
              key={item.href}
              type="button"
              aria-label={item.label}
              aria-current={itemIndex === index ? "true" : undefined}
              onClick={() => setIndex(itemIndex)}
              className={itemIndex === index ? "h-2 w-6 rounded-full bg-tech" : "h-2 w-2 rounded-full bg-ink/20"}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 transition hover:bg-paper"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 transition hover:bg-paper"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Portal({
  href,
  kicker,
  title,
  text,
  tone,
}: {
  href: string;
  kicker: string;
  title: string;
  text: string;
  tone: "tech" | "home";
}) {
  return (
    <Link
      href={href}
      className={
        tone === "tech"
          ? "group flex items-center justify-between rounded-3xl bg-tech-deep px-5 py-4 text-cream transition hover:-translate-y-0.5"
          : "group flex items-center justify-between rounded-3xl bg-home px-5 py-4 text-white transition hover:-translate-y-0.5"
      }
    >
      <span>
        <span className="text-xs uppercase tracking-[0.16em] opacity-70">{kicker}</span>
        <span className="mt-1 block font-display text-2xl">{title}</span>
        <span className="text-sm opacity-80">{text}</span>
      </span>
      <ArrowUpRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { STORE_MAP_ID } from "@/lib/maps";
import { site } from "@/lib/site";
import { CatalogImage } from "@/components/CatalogImage";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/lib/i18n";
import { countProducts, formatCount } from "@/lib/format";
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
    <section className="relative overflow-hidden lg:flex lg:min-h-0 lg:flex-1">
      <Image
        src="/its_logo.svg"
        alt=""
        aria-hidden
        width={1558}
        height={785}
        priority
        className="pointer-events-none absolute -left-6 top-1/2 w-[min(760px,80vw)] max-w-none -translate-y-1/2 select-none opacity-[0.12] blur-[8px] dark:opacity-[0.5] dark:blur-[5px]"
      />
      <div className="shell relative z-10 grid items-center gap-4 py-4 sm:gap-6 sm:py-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:min-h-0 lg:flex-1 lg:gap-12 lg:py-6">
        <div>
          <motion.h1
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="max-w-xl font-display text-3xl leading-[0.95] sm:text-5xl md:text-6xl xl:text-7xl"
          >
            {dict.hero.title}
          </motion.h1>
          <motion.p
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="mt-3 max-w-xl text-sm leading-6 text-ink/70 sm:mt-6 sm:text-lg sm:leading-8"
          >
            {fill(dict.hero.subtitle, { tech: formatCount(techCount), home: formatCount(homeCount) })}
          </motion.p>
          <motion.div
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease }}
            className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6"
          >
            <WhatsAppCta variant="primary" />
            <Link
              href={`/kontakt#${STORE_MAP_ID}`}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-tech hover:text-tech dark:border-white/15 dark:bg-surface dark:text-cream"
            >
              <MapPin className="h-4 w-4" aria-hidden />
              {dict.hero.findStore}
            </Link>
            <a
              href={site.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink/80 transition hover:border-tech hover:text-tech dark:border-white/15 dark:text-cream/85"
            >
              {dict.hero.openGoogleMaps}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>
          <div className="mt-4 grid gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-3">
            <Portal
              href="/tehnologija"
              kicker={dict.nav.technology}
              title={dict.nav.technology}
              text={countProducts(techCount, dict)}
              tone="tech"
            />
            <Portal
              href="/dom"
              kicker={dict.nav.home}
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

const slideEase = [0.22, 1, 0.36, 1] as const;

const heroSlideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 28 : -28,
    scale: 0.97,
    filter: "blur(6px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -20 : 20,
    scale: 0.985,
    filter: "blur(4px)",
  }),
};

function HeroSlideshow({ shots, fromCatalog }: { shots: HeroShot[]; fromCatalog: string }) {
  const { dict } = useLocale();
  const { formatPrice } = useCurrency();
  const reduceMotion = useReducedMotion();
  const [deck, setDeck] = useState<HeroShot[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const shot = deck[index];

  const slideTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.62, ease: slideEase };

  useEffect(() => {
    setDeck(shots.slice(0, 24));
    setIndex(0);
    setDirection(1);
  }, [shots]);

  useEffect(() => {
    if (paused || deck.length < 2) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % deck.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, deck]);

  function go(step: number) {
    setDirection(step >= 0 ? 1 : -1);
    setIndex((current) => (current + step + deck.length) % deck.length);
  }

  if (!shot) {
    return <div className="rounded-[2rem] border border-ink/10 bg-card p-5 shadow-lift sm:p-6" aria-hidden />;
  }

  const meta = sourceMeta[shot.source];
  const division =
    shot.source === "treco"
      ? dict.nav.technology
      : shot.source === "tremark"
        ? dict.nav.home
        : shot.source === "alevado"
          ? dict.catalog.alevadoProducts
          : "ITS Group";
  return (
    <div
      className="rounded-[2rem] border border-ink/10 bg-card p-3 shadow-lift sm:p-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tech">{fromCatalog}</p>
        <p className={meta.tone === "tech" ? "text-xs font-semibold text-tech" : "text-xs font-semibold text-home"}>
          {division}
        </p>
      </div>

      <div className="relative mt-3 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={`${shot.href}-${index}`}
            custom={direction}
            variants={heroSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <Link href={shot.href} className="block">
              <div className="flex aspect-[5/4] max-h-[min(34dvh,220px)] w-full items-center justify-center overflow-hidden rounded-2xl bg-white sm:max-h-[min(36dvh,260px)] lg:max-h-[280px]">
                <motion.div
                  className="flex h-full w-full items-center justify-center"
                  initial={reduceMotion ? false : { scale: 1.04 }}
                  animate={{ scale: 1 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.85, ease: slideEase }}
                >
                  <CatalogImage src={shot.src} alt={shot.alt} className="max-h-full max-w-full object-contain p-3" />
                </motion.div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 sm:mt-3 sm:text-base sm:leading-6">
                {shot.label}
              </p>
              <p className="mt-1 font-display text-base sm:text-lg">{formatPrice(shot.price)}</p>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-3 sm:mt-4">
        {deck.length <= 10 ? (
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {deck.map((item, itemIndex) => (
              <button
                key={item.href}
                type="button"
                aria-label={item.label}
                aria-current={itemIndex === index ? "true" : undefined}
                onClick={() => {
                  setDirection(itemIndex > index ? 1 : -1);
                  setIndex(itemIndex);
                }}
                className={
                  itemIndex === index
                    ? "h-2 w-6 shrink-0 rounded-full bg-tech"
                    : "h-2 w-2 shrink-0 rounded-full bg-ink/20"
                }
              />
            ))}
          </div>
        ) : (
          <p className="min-w-0 flex-1 text-xs tabular-nums text-ink/50">
            {index + 1} / {deck.length}
          </p>
        )}
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 transition hover:bg-paper sm:h-10 sm:w-10"
            aria-label={dict.hero.previous}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 transition hover:bg-paper sm:h-10 sm:w-10"
            aria-label={dict.hero.next}
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
          ? "group flex items-center justify-between rounded-2xl bg-tech-deep px-4 py-3 text-cream transition hover:-translate-y-0.5 sm:rounded-3xl sm:px-5 sm:py-4"
          : "group flex items-center justify-between rounded-2xl bg-home px-4 py-3 text-white transition hover:-translate-y-0.5 sm:rounded-3xl sm:px-5 sm:py-4"
      }
    >
      <span>
        <span className="text-[10px] uppercase tracking-[0.16em] opacity-70 sm:text-xs">{kicker}</span>
        <span className="mt-0.5 block font-display text-xl sm:mt-1 sm:text-2xl">{title}</span>
        <span className="text-xs opacity-80 sm:text-sm">{text}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-5 sm:w-5" />
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <header className="shell min-w-0 pb-6 pt-8 sm:pb-8 sm:pt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl font-display text-3xl leading-[1.08] sm:text-4xl md:text-6xl">{title}</h1>
      {text && <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">{text}</p>}
    </header>
  );
}

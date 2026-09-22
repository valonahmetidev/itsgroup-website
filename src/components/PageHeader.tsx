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
    <header className="shell pb-8 pt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[1.05] md:text-6xl">{title}</h1>
      {text && <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">{text}</p>}
    </header>
  );
}

type PageHeaderProps = {
  label: string;
  title: string;
  highlightedTitle: string;
  description: string;
};

export default function PageHeader({
  label,
  title,
  highlightedTitle,
  description,
}: PageHeaderProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.30em] text-[#d4af37]">
        {label}
      </p>

      <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-extrabold leading-none">
        {title}
        <span className="block text-[#ffd978]">{highlightedTitle}</span>
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
        {description}
      </p>
    </div>
  );
}
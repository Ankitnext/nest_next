type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-6 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-slate-50 md:text-3xl">{title}</h2>
      <p className="max-w-3xl text-sm text-slate-300 md:text-base">{description}</p>
    </div>
  );
}


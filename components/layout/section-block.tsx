import type { ReactNode } from "react";

type SectionBlockProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SectionBlock({
  eyebrow,
  title,
  description,
  children,
}: SectionBlockProps) {
  return (
    <section className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

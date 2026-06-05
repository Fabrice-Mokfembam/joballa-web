import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function AuthBrandAside() {
  const t = await getTranslations("auth.branding");

  return (
    <aside className="hidden w-[437px] shrink-0 flex-col justify-between bg-[color:var(--auth-brand-panel-bg)] px-7 py-7 lg:order-2 lg:flex lg:min-h-screen">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-[20px]" aria-hidden>
            <Image
              src="/brand/auth-logo-mark.png"
              alt=""
              fill
              className="object-contain"
              sizes="44px"
              priority
            />
          </span>
          <span className="font-remixa text-[28px] font-bold leading-8 tracking-tight text-[color:var(--auth-brand-wordmark-fg)] lg:text-[32px] lg:leading-8">
            joballa
          </span>
        </div>
        <div className="mt-8 font-remixa text-[clamp(28px,8vw,48px)] font-bold leading-[48px] tracking-normal text-[color:var(--auth-brand-tagline-fg)] lg:text-[48px] lg:leading-[48px]">
          <p className="leading-tight">{t("line1")}</p>
          <p className="leading-tight">{t("line2")}</p>
          <p className="leading-tight">{t("line3")}</p>
          <p className="leading-tight">{t("line4")}</p>
        </div>
      </div>
      <div className="mt-10 text-sm font-normal leading-5 text-[color:var(--auth-brand-support-fg)] lg:mt-0">
        <p>{t("supportTitle")}</p>
        <p className="mt-1">
          <span>{t("supportBody")} </span>
          <a href={`mailto:${t("supportEmail")}`} className="border-b border-current">
            {t("supportEmail")}
          </a>
        </p>
      </div>
    </aside>
  );
}

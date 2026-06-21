"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import WalletButton from "./wallet-button";

export default function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();

  const switchLocale = (l: string) => {
    const next = path.replace(`/${locale}`, `/${l}`);
    router.push(next);
  };

  const NAV: [string, string][] = [
    ["dashboard", "/dashboard"],
    ["agents", "/agents"],
    ["memories", "/memories"],
    ["spaces", "/shared-spaces"],
    ["artifacts", "/artifacts"],
    ["permissions", "/permissions"],
    ["wallet", "/wallet"],
    ["help", "/help"],
  ];

  return (
    <header className="border-b border-wood/20 bg-paper/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-sm bg-cinnabar text-rice flex items-center justify-center font-song text-lg shadow">
            NM
          </span>
          <div>
            <div className="font-song text-xl text-ink">{t("brand")}</div>
            <div className="text-xs text-wood">{t("tagline")}</div>
          </div>
        </Link>

        <nav className="hidden lg:flex gap-5 text-sm text-wood">
          {NAV.map(([k, href]) => (
            <Link
              key={k}
              href={`/${locale}${href}`}
              className="hover:text-cinnabar transition"
            >
              {t(`nav.${k}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <WalletButton />
          <select
            value={locale}
            onChange={(e) => switchLocale(e.target.value)}
            className="bg-rice border border-wood/30 text-wood rounded px-2 py-1 text-sm"
          >
            <option value="en">English</option>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </div>
      </div>
    </header>
  );
}

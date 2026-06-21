"use client";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();
  function switchLocale(l: string) {
    router.push(path.replace(`/${locale}`, `/${l}`));
  }
  return (
    <div>
      <h2 className="font-song text-3xl mb-6 text-ink">{t("title")}</h2>
      <div className="bg-paper/60 border border-wood/20 p-6 rounded-sm space-y-4">
        <div>
          <div className="text-sm text-wood mb-2">{t("language")}</div>
          <select
            defaultValue={locale}
            onChange={(e) => switchLocale(e.target.value)}
            className="bg-rice border border-wood/30 rounded px-3 py-2"
          >
            <option value="en">English</option>
            <option value="zh-CN">Simplified Chinese</option>
            <option value="zh-TW">Traditional Chinese</option>
          </select>
        </div>
        <div>
          <div className="text-sm text-wood mb-2">{t("apiKeys")}</div>
          <code className="block bg-rice border border-wood/30 rounded px-3 py-2 text-xs">
            OPENAI_API_KEY / SUI_ADMIN_PRIVATE_KEY / WALRUS_PUBLISHER ...
          </code>
        </div>
      </div>
    </div>
  );
}

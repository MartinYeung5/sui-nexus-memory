import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("home");
  const features = [
    [t("feature1Title"), t("feature1Desc")],
    [t("feature2Title"), t("feature2Desc")],
    [t("feature3Title"), t("feature3Desc")]
  ];
  return (
    <section className="py-16">
      <div className="text-center">
        <h1 className="font-song text-4xl md:text-5xl text-ink leading-tight">
          {t("heroTitle")}
        </h1>
        <p className="mt-6 text-wood max-w-2xl mx-auto">{t("heroDesc")}</p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href={`/${locale}/dashboard`}
            className="px-6 py-3 bg-wood text-rice rounded-sm shadow hover:bg-ink transition"
          >
            {t("enter")}
          </Link>
          <Link
            href={`/${locale}/wallet`}
            className="px-6 py-3 bg-cinnabar text-rice rounded-sm hover:bg-wood transition"
          >
            Connect Wallet →
          </Link>
          <Link
            href={`/${locale}/help`}
            className="px-6 py-3 border border-wood text-wood rounded-sm hover:bg-paper"
          >
            User Guide
          </Link>
        </div>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-6">
        {features.map(([t1, t2]) => (
          <div
            key={t1}
            className="bg-paper/60 border border-wood/20 p-6 rounded-sm shadow-sm"
          >
            <div className="font-song text-xl text-cinnabar">{t1}</div>
            <p className="mt-2 text-sm text-wood">{t2}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-paper/40 border border-wood/20 rounded-sm p-6">
        <div className="font-song text-xl text-ink mb-4">What can I do here?</div>
        <div className="grid md:grid-cols-4 gap-3 text-sm">
          {[
            ["Connect Sui Wallet", "/wallet"],
            ["Create an Agent", "/agents"],
            ["Write & Search Memory", "/memories"],
            ["Upload Artifacts", "/artifacts"]
          ].map(([label, href]) => (
            <Link
              key={href}
              href={`/${locale}${href}`}
              className="bg-rice border border-wood/20 rounded-sm px-4 py-3 hover:border-cinnabar transition flex justify-between items-center"
            >
              <span className="text-ink">{label}</span>
              <span className="text-cinnabar">→</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-xs text-wood">
          Full step-by-step instructions live in{" "}
          <Link href={`/${locale}/help`} className="text-cinnabar underline">
            User Guide
          </Link>
          .
        </div>
      </div>
    </section>
  );
}

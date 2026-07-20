"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const NAV_ITEMS = [
  { href: "/", key: "home" as const, icon: "🏠" },
  { href: "/goals", key: "goals" as const, icon: "🎯" },
  { href: "/calendar", key: "calendar" as const, icon: "📅" },
  { href: "/newsletter", key: "newsletter" as const, icon: "🤖" },
  { href: "/settings", key: "settings" as const, icon: "⚙️" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { dict, lang, setLang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-row items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 md:w-56 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:px-4 md:py-6">
        <div className="mb-0 flex items-center gap-2 text-lg font-semibold text-cyan-400 md:mb-8">
          <span>✨</span>
          <span>{dict.appName}</span>
        </div>
        <nav className="flex flex-1 flex-row gap-1 md:flex-col md:gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{dict.nav[item.key]}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden flex-col gap-2 md:flex">
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="rounded-lg px-3 py-2 text-left text-xs text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
          >
            {lang === "zh" ? "English" : "中文"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-left text-xs text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
          >
            {dict.logout}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

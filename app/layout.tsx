import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  const title = settings.brandName
    ? `${settings.brandName} | ${settings.tagline || "Learn AI the simplest way possible"}`
    : "Learn AI the simplest way possible";
  const description =
    settings.subheadline ||
    "Simple tutorials for building websites, apps and automations. Start with an idea and learn by making it real.";

  return {
    title,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    openGraph: {
      title,
      description,
      images: [settings.ogImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/images/zenvora-icon.png" type="image/png" />
        <link rel="shortcut icon" href="/images/zenvora-icon.png" />
        <link rel="apple-touch-icon" href="/images/zenvora-icon.png" />
      </head>
      <body className="bg-white text-slate-900 antialiased min-h-screen flex flex-col font-sans selection:bg-brand selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

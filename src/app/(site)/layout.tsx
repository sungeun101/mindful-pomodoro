import "../globals.css";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Link from "next/link";
import { Metadata } from "next";
import { getPages } from "../../../sanity/utils/page";

const font = Open_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro Yoga",
  description:
    "Pomodoro Technique's time management principles in conjunction with yoga practice",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await getPages();

  return (
    <html lang="en">
      <body className="max-w-4xl mx-auto py-10 px-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent text-lg font-bold"
          >
            Pomodoro Yoga
          </Link>
          <div className="flex items-center gap-5 text-sm text-gray-600 dark:text-white">
            {pages.map((page) => (
              <Link
                key={page._id}
                href={`/${page.slug}`}
                className="hover:underline"
              >
                {page.title}
              </Link>
            ))}
          </div>
        </header>
        <main className={font.className + ` py-20`}>{children}</main>
      </body>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3433043029322945"
        crossOrigin="anonymous"
      ></Script>
    </html>
  );
}

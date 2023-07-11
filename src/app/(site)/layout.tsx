import "../globals.css";
import { Inter } from "next/font/google";
import ReactQueryProvider from "@/utils/react-query/provider";
import Script from "next/script";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Link from "next/link";
import { getPages } from "../../../sanity/utils/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
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
      <body className="max-w-3xl mx-auto py-10">
        <ReactQueryProvider>
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
          <main className="py-20">{children}</main>
        </ReactQueryProvider>
      </body>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3433043029322945"
        crossOrigin="anonymous"
      ></Script>
    </html>
  );
}

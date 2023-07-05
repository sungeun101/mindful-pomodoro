import "./globals.css";
import { Inter } from "next/font/google";
import ReactQueryProvider from "@/utils/react-query/provider";
import Script from "next/script";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mindful Pomodoro",
  description:
    "Pomodoro Timer with Yoga and Stretching Videos During Break Time. Discover the benefits of moving around during break time for increased productivity. Learn how regular breaks can enhance focus and overall well-being.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3433043029322945"
        crossOrigin="anonymous"
      ></Script>
    </html>
  );
}

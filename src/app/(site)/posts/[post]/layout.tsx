import "@fortawesome/fontawesome-svg-core/styles.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Pomodoro Yoga",
  description:
    "Pomodoro Technique's time management principles in conjunction with yoga practice",
};

export default async function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}

// tsrfc
import Link from "next/link";
import React from "react";

type Props = {
  post: {
    id: string;
    date: string;
    title: string;
  };
};

export default function PostItem({ post }: Props) {
  const { id, title, date } = post;

  return (
    <li className="mt-4 text-2xl dark:text-white/90">
      <Link
        className="underline hover:text-black/70 dark:hover:text-white"
        href={`/posts/${id}`}
      >
        {title}
      </Link>
      <br />
    </li>
  );
}

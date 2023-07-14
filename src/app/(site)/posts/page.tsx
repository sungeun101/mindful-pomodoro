import React from "react";
import { getPosts } from "../../../../sanity/utils/post";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "../../../../sanity/lib/urlFor";

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div>
      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            href={`/posts/${post.slug}`}
            key={post._id}
            className="border-2 border-gray-500 rounded-lg p-1 hover:scale-105 hover:border-blue-500 transition"
          >
            {post.image && (
              <Image
                // src={post.image}
                src={urlFor(post.image).url()}
                alt={post.name}
                width={750}
                height={300}
                className="object-cover rounded-lg h-[200px] w-[750px]"
              />
            )}
            <div className="mt-2 font-extrabold bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent">
              {post.name}
            </div>
            <p className="text-gray-500">
              {new Date(post._createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

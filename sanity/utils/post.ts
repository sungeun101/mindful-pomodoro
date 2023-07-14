import { groq } from "next-sanity";
import { client } from "../lib/client";
import { Post } from "@/types/Post";

export async function getPosts(): Promise<Post[]> {
  const data = client.fetch(groq`*[_type == "post"]{
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    "image": image.asset->url,
    url,
    content
  }`);
  return data;
}

export async function getPost(slug: string): Promise<Post> {
  const data = await client.fetch(
    groq`*[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    "image": image.asset->url,
    url,
    content
  }`,
    { slug }
  );
  return data;
}

import { groq } from "next-sanity";
import { client } from "../lib/client";
import { Page } from "@/types/Page";

export async function getPages(): Promise<Page[]> {
  const data = await client.fetch(
    groq`*[_type == "page"]{
        _id,
        _createdAt,
        title,
        "slug": slug.current
      }`
  );
  return data;
}

export async function getPage(slug: string): Promise<Page> {
  const data = await client.fetch(
    groq`*[_type == "page" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        "slug": slug.current,
        content
      }`,
    { slug }
  );
  return data;
}

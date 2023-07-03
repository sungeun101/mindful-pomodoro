"use client";

import { IYoutubeVideo } from "@/types";

export const fetchVideos = async (breakLength: number) => {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");

  const params: any = {
    key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
    q:
      breakLength > 15
        ? `${breakLength} min yoga or stretch or meditation`
        : `${breakLength} min chair yoga or stretch or meditation`,
    part: "snippet",
    type: "video",
    maxResults: 100,
  };

  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key]);
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 }, // Revalidate every 24 hours
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();

  // Filter the videos based on the title
  const filteredVideos = data.items.filter(
    (video: IYoutubeVideo) =>
      video.snippet.title.includes(`${breakLength}`) ||
      video.snippet.description.includes(`${breakLength}`)
  );

  return filteredVideos;
};

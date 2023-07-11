import { app } from "@/app/firebase";
import { IYoutubeVideo } from "@/types/Video";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

const db = getFirestore(app);

export async function GET(request: NextRequest) {
  const fetchVideos = async (breakLength: number) => {
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
      method: "GET",
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

  const saveNewVideosToFirestore = async (
    data: IYoutubeVideo[],
    breakLength: number
  ) => {
    try {
      //Replace the existing documents with the new data
      data.forEach(async (video) => {
        await setDoc(
          doc(db, `${breakLength}min_videos`, video.id.videoId),
          video
        );
      });
    } catch (error) {
      console.error("Error saveNewVideosToFirestore :", error);
    }
  };

  await Promise.all(
    Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map(
      async (breakLength) => {
        const videos = await fetchVideos(breakLength);
        await saveNewVideosToFirestore(videos, breakLength);
      }
    )
  );

  return NextResponse.json({
    status: 200,
    message: "Videos saved to Firestore",
  });
}

"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useFormContext } from "react-hook-form";
import { IYoutubeVideo } from "@/types";
import he from "he";
import VideoShuffleDial from "@/components/VideoShuffleDial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";

export default function Timer({
  index,
  sendNotification,
  handleOpenVideo,
  pomoCount,
  isActiveStep,
  startNextTimer,
  gotNewVideoFromFirestore,
  setGotNewVideoFromFirestore,
}: {
  index: number;
  sendNotification: ({
    message,
    audio,
  }: {
    message: string;
    audio: string;
  }) => void;
  handleOpenVideo: (video: IYoutubeVideo) => void;
  pomoCount: number;
  isActiveStep: boolean;
  startNextTimer: () => void;
  gotNewVideoFromFirestore: boolean;
  setGotNewVideoFromFirestore: (value: boolean) => void;
}) {
  const {
    register,
    formState: { isValid },
    watch,
  } = useFormContext();

  const sessionLength = watch(`pomos.${index}.sessionLength`);
  const breakLength = watch(`pomos.${index}.breakLength`);

  const [minutes, setMinutes] = useState(sessionLength | 0);
  const [seconds, setSeconds] = useState(0);
  const [isSession, setIsSession] = useState(true);
  const [isWorking, setIsWorking] = useState(index > 0);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [video, setVideo] = useState<IYoutubeVideo | null>(null);

  const phaseLabel = isSession
    ? `Session ${index + 1 + "/" + pomoCount}`
    : "Break";

  const getUniqueVideo = useCallback(async () => {
    const breakLength = watch(`pomos.${index}.breakLength`);
    const key = `${breakLength}min_videos`;
    const videos = localStorage.getItem(key);

    if (videos) {
      try {
        const parsedVideos = JSON.parse(videos);
        if (Array.isArray(parsedVideos)) {
          const shuffledVideos = parsedVideos.sort(() => 0.5 - Math.random());
          setVideo(shuffledVideos[0]);
          setGotNewVideoFromFirestore(false);
        } else {
          console.error("Parsed videos is not an array:", parsedVideos);
        }
      } catch (error) {
        console.error("Error parsing videos from localStorage:", error);
      }
    }
  }, [index, watch]);

  useEffect(() => {
    getUniqueVideo();
  }, [breakLength, getUniqueVideo, gotNewVideoFromFirestore]);

  const startTimer = () => {
    setIsWorking(true);
  };

  const pauseTimer = () => {
    setIsWorking(false);
  };

  const resetTimer = () => {
    console.log("reset");
    setMinutes(1);
    setSeconds(0);
    setIsSession(true);
    setIsWorking(false);
  };

  useEffect(() => {
    let interval: any = null;

    if (isActiveStep && isWorking) {
      if (!isSessionStarted) {
        // Send notification only when the session starts for the first time
        sendNotification({
          message: "Session started",
          audio: "/alarm.mp3",
        });
        setIsSessionStarted(true);
      }

      if (minutes === 0 && seconds === 0) {
        // Timer is over
        if (isSession) {
          // Session is over
          setIsSession(false);
          setMinutes(1);
          sendNotification({
            message: "Enjoy your break!",
            audio: "/alarm_finish.mp3",
          });
          if (video) handleOpenVideo(video);
        } else {
          // Break is over
          clearInterval(interval);
          if (index < pomoCount - 1) {
            // if there are more pomos, start next one
            startNextTimer();
            setVideo(null); // Hide video
          } else {
            // last pomo
            sendNotification({
              message: "Well done!",
              audio: "/alarm_claps.mp3",
            });
          }
        }
      } else {
        // Timer is still running
        interval = setInterval(() => {
          if (seconds === 0) {
            // Minutes are over
            setMinutes((prevMinutes) => prevMinutes - 1);
            setSeconds(59);
          } else {
            // Minutes are still running
            setSeconds((prevSeconds) => prevSeconds - 1);
          }
        }, 1000);
      }
    }

    return () => clearInterval(interval);
  }, [isActiveStep, isWorking, minutes, seconds, isSession]);

  return (
    <div className="grid 2xl:grid-cols-2 px-10">
      <section className="flex flex-col justify-center items-center">
        {/* Timer */}
        <div
          className={`w-48 h-48 ${
            isActiveStep ? "bg-[#EF4168]" : "bg-gray-300"
          } text-white rounded-full flex flex-col justify-center items-center gap-2 p-2 relative`}
        >
          <h2>{phaseLabel}</h2>
          <div className="text-3xl pt-2">
            <span>{minutes?.toString().padStart(2, "0")}</span>:
            <span>{seconds?.toString().padStart(2, "0")}</span>
          </div>
          {isActiveStep && (
            <button
              onClick={isWorking ? pauseTimer : startTimer}
              disabled={!isValid}
              className="bg-white text-[#EF4168] rounded-full w-12 h-12 hover:bg-white drop-shadow-lg absolute -top-5  shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {isWorking ? (
                <FontAwesomeIcon icon={faPause} size={"lg"} />
              ) : (
                <FontAwesomeIcon icon={faPlay} size={"lg"} />
              )}
            </button>
          )}
        </div>
        {/* Timer Setting */}
        <div className="flex flex-col my-4 gap-2">
          <span>
            Session :
            <select
              {...register(`pomos.${index}.sessionLength`)}
              className="bg-white text-[#EF4168] w-12 mx-1 px-1 py-1 rounded-md shadow-md cursor-pointer"
            >
              {Array.from([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </select>
            mins
          </span>
          <span>
            Break :
            <select
              {...register(`pomos.${index}.breakLength`)}
              className="bg-white text-[#EF4168] w-12 mx-1 px-1 py-1 rounded-md shadow-md cursor-pointer"
            >
              {Array.from([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </select>
            mins
          </span>
        </div>
      </section>

      {video && (
        <section className="relative flex flex-col justify-center items-center">
          <div
            onClick={() => handleOpenVideo(video)}
            className="hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col justify-center items-center bg-white  w-[320px] "
          >
            <Image
              src={video.snippet.thumbnails.medium.url}
              width={video.snippet.thumbnails.medium.width}
              height={video.snippet.thumbnails.medium.height}
              alt="thumbnail"
              className="mx-auto rounded-lg"
            />
            <div className="text-lg mt-2 font-bold">
              {he.decode(video.snippet.title)}
            </div>
            <span className="text-xs mt-2 ">{video.snippet.channelTitle}</span>
          </div>
          <VideoShuffleDial
            getBreakVideos={getUniqueVideo}
            resetTimer={resetTimer}
          />
        </section>
      )}
    </div>
  );
}

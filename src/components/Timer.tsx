"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import ReplayIcon from "@mui/icons-material/Replay";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useFormContext } from "react-hook-form";
import { IYoutubeVideo } from "@/types";
import he from "he";
import VideoShuffleDial from "@/components/VideoShuffleDial";

export default function Timer({
  index,
  sendNotification,
  handleOpenVideo,
  pomoCount,
  isActiveStep,
  localStorageVideos,
  startNextTimer,
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
  localStorageVideos: any;
  startNextTimer: () => void;
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
        const shuffledVideos = parsedVideos.sort(() => 0.5 - Math.random());

        setVideo(shuffledVideos[0]);
      } catch (error) {
        console.error("Error parsing videos from localStorage:", error);
      }
    }
  }, [index, watch]);

  useEffect(() => {
    getUniqueVideo();
  }, [breakLength, getUniqueVideo, localStorageVideos]);

  const startTimer = () => {
    setIsWorking(true);
  };

  const pauseTimer = () => {
    setIsWorking(false);
  };

  const resetTimer = () => {
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
    <section>
      {/* Timer */}
      <div className="w-48 h-48 bg-[#EF4168] text-white rounded-full flex flex-col justify-center items-center gap-4 p-2">
        <h2 className="pt-8">{phaseLabel}</h2>
        <div className="text-3xl pt-2">
          <span>{minutes?.toString().padStart(2, "0")}</span>:
          <span>{seconds?.toString().padStart(2, "0")}</span>
        </div>
        {isActiveStep && (
          <button
            onClick={isWorking ? pauseTimer : startTimer}
            disabled={!isValid}
            className="bg-white text-[#EF4168] rounded-full w-12 h-12 hover:bg-white drop-shadow-lg"
          >
            {isWorking ? (
              <PauseIcon fontSize="medium" />
            ) : (
              <PlayArrowIcon fontSize="medium" />
            )}
          </button>
        )}
      </div>
      {/* Timer Setting */}
      <div className="flex flex-col my-3">
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

      {video && (
        <div className="relative">
          <VideoShuffleDial
            getBreakVideos={getUniqueVideo}
            resetTimer={resetTimer}
          />
          <div
            onClick={() => handleOpenVideo(video)}
            className="hover:scale-105 transition-all duration-300 cursor-pointer"
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
        </div>
      )}
    </section>
  );
}

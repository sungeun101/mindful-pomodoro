"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { IYoutubeVideo } from "@/types";
import VideoDialog from "@/components/VideoDialog";
import { initFirebase } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, getFirestore } from "@firebase/firestore";
import Timer from "@/components/Timer";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import { mockVideos } from "./mockData";

export interface FormData {
  pomos: {
    sessionLength: number;
    breakLength: number;
  }[];
}

export default function Home() {
  const defaultPomoCount = 5;
  const defaultSessionLength = 25;
  const defaultBreakLength = 10;
  const defaultPomos = useMemo(() => {
    const pomos = [];
    for (let i = 0; i < defaultPomoCount; i++) {
      pomos.push({
        sessionLength: defaultSessionLength,
        breakLength: defaultBreakLength,
      });
    }
    return pomos;
  }, []);
  const methods = useForm<FormData>({
    defaultValues: {
      pomos: defaultPomos,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "pomos",
  });

  const app = initFirebase();
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const db = getFirestore(app);

  const [notificationMssage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [selectedVideo, setSelectedVideo] = useState<IYoutubeVideo | null>(
    null
  );
  const [pomoCount, setPomoCount] = useState(defaultPomoCount);
  const [sessionLength, setSessionLength] = useState(defaultSessionLength);
  const [breakLength, setBreakLength] = useState(defaultBreakLength);
  const [activeStep, setActiveStep] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSessionLengthChange = (event: { target: { value: string } }) => {
    const selectedValue = parseInt(event.target.value, 10);
    setSessionLength(selectedValue);
    // Update the sessionLength value for all pomos in the form data
    const updatedPomos = methods.getValues("pomos").map((pomo: any) => ({
      ...pomo,
      sessionLength: selectedValue,
    }));
    methods.setValue("pomos", updatedPomos);
  };

  const handleBreakLengthChange = (event: { target: { value: string } }) => {
    const selectedValue = parseInt(event.target.value, 10);
    setBreakLength(selectedValue);

    // Update the breakLength value for all pomos in the form data
    const updatedPomos = methods.getValues("pomos").map((pomo: any) => ({
      ...pomo,
      breakLength: selectedValue,
    }));
    methods.setValue("pomos", updatedPomos);
  };

  const handlePomoCountChange = (event: { target: { value: string } }) => {
    const newPomoCount = parseInt(event.target.value);
    setPomoCount(newPomoCount);
    // Add or remove pomos based on the new count
    if (newPomoCount > fields.length) {
      // Add pomos
      const diff = newPomoCount - fields.length;
      for (let i = 0; i < diff; i++) {
        append({
          sessionLength: defaultSessionLength,
          breakLength: defaultBreakLength,
        });
      }
    } else if (newPomoCount < fields.length) {
      // Remove pomos
      const diff = fields.length - newPomoCount;
      for (let i = 0; i < diff; i++) {
        remove(fields.length - 1);
      }
    }
  };

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    console.log(result.user);
  };

  const logout = async () => {
    await auth.signOut();
  };

  const getVideosFromFirestore = async (collectionName: string) => {
    // get from firestore because matching localStorage data is empty
    const querySnapshot = await getDocs(collection(db, collectionName));
    const videos: any[] = [];
    querySnapshot.forEach((doc) => {
      videos.push(doc.data());
    });
    return videos;
  };

  const handleNotificationClose = () => {
    setNotificationMessage(null);
  };

  const sendNotification = ({
    message,
    audio,
  }: {
    message: string;
    audio: string;
  }) => {
    setNotificationMessage(message);
    audioRef.current = new Audio(audio);
    audioRef.current?.play();
  };

  const handleOpenVideo = (video: IYoutubeVideo) => {
    setSelectedVideo(video);
  };

  const breakLengths = useWatch({
    name: "pomos",
    control: methods.control,
  }).map((pomo) => pomo.breakLength);

  const uniqueBreakLengths = breakLengths.filter(
    (value, index, self) => self.indexOf(value) === index
  );

  const prevUniqueBreakLengths = useRef(uniqueBreakLengths);

  useEffect(() => {
    const changedBreakLengths = uniqueBreakLengths.filter(
      (length, index) => length !== prevUniqueBreakLengths.current[index]
    );
    console.log("해당 비디오 있는지 없는지 검사 : ", [
      ...uniqueBreakLengths,
      ...changedBreakLengths,
    ]);

    [...uniqueBreakLengths, ...changedBreakLengths].forEach(
      async (breakLength) => {
        const key = `${breakLength}min_videos`;
        const videos = localStorage.getItem(key);
        if (videos === "{}" || !videos) {
          console.log(
            key,
            "localstorage에 비디오 없음, firestore에서 가져오기"
          );
          // const videosFromFirestore = mockVideos;
          const videosFromFirestore = await getVideosFromFirestore(key);
          if (videosFromFirestore && videosFromFirestore.length > 0) {
            console.log(
              "firestore에서 가져온",
              key,
              " : ",
              videosFromFirestore
            );
            localStorage.setItem(key, JSON.stringify(videosFromFirestore));
          } else {
            console.log("firestore에 해당 비디오 없음");
          }
        } else {
          console.log("localStorage에서", key, " 가져옴");
        }
      }
    );

    prevUniqueBreakLengths.current = uniqueBreakLengths;
  }, [uniqueBreakLengths]);

  const handleStartNextTimer = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  return (
    <div className="relative bg-white text-[#1F1B2E] min-h-screen w-full font-mono px-20 py-28">
      {/* Top navigation */}
      <div className="fixed top-0 left-0 w-full py-2 px-10 bg-white shadow-sm flex items-center justify-between z-100">
        <Image
          src="/logo.png"
          alt="Pomodoro Logo"
          width={100}
          height={24}
          priority
        />
        {user ? (
          <div className="flex items-center space-x-2">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt="User Profile"
                width={28}
                height={28}
                className="rounded-full"
              />
            )}
            <span>{user.displayName}</span>
            <button
              onClick={logout}
              className="border border-[#EF4168] text-[#EF4168]  rounded-md px-2 h-10 shadow-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="border border-[#EF4168] text-[#EF4168]  rounded-md px-2 h-10 shadow-sm"
          >
            Login
          </button>
        )}
      </div>

      <main className="flex flex-col gap-4">
        <div className="flex flex-col items-center ml-4">
          <h4 className="text-gray-500">Session Length</h4>
          <div className="flex items-center gap-2">
            <select value={sessionLength} onChange={handleSessionLengthChange}>
              {/* {Array.from([1, 2, 3, 4, 5]).map((value) => (
                <option
                  key={value}
                  value={value}
                  defaultValue={defaultSessionLength}
                >
                  {value}
                </option>
              ))} */}
              {Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                    defaultValue={defaultSessionLength}
                  >
                    {value}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center ml-4">
          <h4 className="text-gray-500">Break Length</h4>
          <div className="flex items-center gap-2">
            <select onChange={handleBreakLengthChange} value={breakLength}>
              {/* {Array.from([1, 2, 3, 4, 5]).map((value) => (
                <option
                  key={value}
                  value={value}
                  defaultValue={defaultBreakLength}
                >
                  {value}
                </option>
              ))} */}
              {Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                    defaultValue={defaultBreakLength}
                  >
                    {value}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center ml-4">
          <h4 className="text-gray-500">Pomos</h4>
          <div className="flex items-center gap-2">
            <select onChange={handlePomoCountChange} value={pomoCount}>
              {Array.from([
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
              ]).map((value) => (
                <option
                  key={value}
                  value={value}
                  defaultValue={defaultPomoCount}
                >
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center ml-4">
          <h4 className="text-gray-500">Completed</h4>
          {activeStep}
        </div>

        <div className="flex flex-col items-center ml-4">
          <FormProvider {...methods}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {fields.map((field, index) => (
                <Step
                  key={field.id}
                  active={index === activeStep}
                  className="border rounded-lg border-[#EF4168]"
                >
                  <StepLabel>
                    <Timer
                      index={index}
                      sendNotification={sendNotification}
                      handleOpenVideo={handleOpenVideo}
                      pomoCount={pomoCount}
                      isActiveStep={index === activeStep}
                      startNextTimer={handleStartNextTimer}
                    />
                  </StepLabel>

                  <StepContent>this only opens for activeStep</StepContent>
                </Step>
              ))}
            </Stepper>
          </FormProvider>
        </div>
      </main>

      <VideoDialog video={selectedVideo} setVideo={setSelectedVideo} />

      {/* Snackbar for notifications */}
      <Snackbar
        open={Boolean(notificationMssage)}
        autoHideDuration={5000}
        onClose={handleNotificationClose}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleNotificationClose}
          severity="success"
          sx={{ backgroundColor: "#EF4168", color: "white" }}
        >
          {notificationMssage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

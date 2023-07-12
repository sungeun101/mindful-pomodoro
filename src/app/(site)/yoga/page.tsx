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
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, getFirestore } from "@firebase/firestore";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { FirebaseError } from "firebase/app";
import { IYoutubeVideo } from "@/types/Video";
import Timer from "../../components/Timer";
import VideoDialog from "../../components/VideoDialog";
import { initFirebase } from "../../firebase";

export interface FormData {
  pomos: {
    sessionLength: number;
    breakLength: number;
  }[];
}

export default function TimerPage() {
  const app = initFirebase();
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const db = getFirestore(app);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [notificationMssage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [selectedVideo, setSelectedVideo] = useState<IYoutubeVideo | null>(
    null
  );
  const [pomoCount, setPomoCount] = useState(6);
  const [sessionLength, setSessionLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [activeStep, setActiveStep] = useState(0);
  const [gotNewVideoFromFirestore, setGotNewVideoFromFirestore] =
    useState(false);

  const defaultPomos = useMemo(() => {
    const pomos = [];
    for (let i = 0; i < pomoCount; i++) {
      console.log("sessionLength", sessionLength, "breakLength", breakLength);
      pomos.push({
        sessionLength,
        breakLength,
      });
    }
    return pomos;
  }, [breakLength, pomoCount, sessionLength]);

  const methods = useForm<FormData>({
    defaultValues: {
      pomos: defaultPomos,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "pomos",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      setPomoCount(parseInt(localStorage.getItem("defaultPomoCount") || "6"));
      setSessionLength(
        parseInt(localStorage.getItem("defaultSessionLength") || "25")
      );
      setBreakLength(
        parseInt(localStorage.getItem("defaultBreakLength") || "5")
      );
      const updatedPomos = methods.getValues("pomos").map((pomo: any) => ({
        ...pomo,
        sessionLength: parseInt(
          localStorage.getItem("defaultSessionLength") ||
            sessionLength.toString()
        ),
        breakLength: parseInt(
          localStorage.getItem("defaultBreakLength") || breakLength.toString()
        ),
      }));
      methods.setValue("pomos", updatedPomos);
    }
  }, []);

  const handleSessionLengthChange = (event: { target: { value: string } }) => {
    const selectedValue = parseInt(event.target.value, 10);
    setSessionLength(selectedValue);
    localStorage.setItem("defaultSessionLength", selectedValue.toString());
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
    localStorage.setItem("defaultBreakLength", selectedValue.toString());
    // Update the breakLength value for all pomos in the form data
    const updatedPomos = methods.getValues("pomos").map((pomo: any) => ({
      ...pomo,
      breakLength: selectedValue,
    }));
    methods.setValue("pomos", updatedPomos);
  };

  const handlePomoCountChange = (event: { target: { value: string } }) => {
    console.log("newPomoCount", event.target.value);
    const newPomoCount = parseInt(event.target.value);
    setPomoCount(newPomoCount);
    localStorage.setItem("defaultPomoCount", newPomoCount.toString());
  };

  useEffect(() => {
    if (pomoCount > fields.length) {
      // Add pomos
      const diff = pomoCount - fields.length;
      for (let i = 0; i < diff; i++) {
        append({
          sessionLength,
          breakLength,
        });
      }
    } else if (pomoCount < fields.length) {
      // Remove pomos
      const diff = fields.length - pomoCount;
      for (let i = 0; i < diff; i++) {
        remove(fields.length - 1);
      }
    }
  }, [pomoCount, fields]);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
    } catch (error) {
      if ((error as FirebaseError).code === "auth/popup-closed-by-user") {
        // User closed the sign-in popup
        console.log("Sign-in popup closed by user");
      } else {
        // Other authentication errors
        console.error("Sign-in error:", error);
      }
    }
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
  console.log("uniqueBreakLengths", uniqueBreakLengths);

  const prevUniqueBreakLengths = useRef(uniqueBreakLengths);

  useEffect(() => {
    const changedBreakLengths = uniqueBreakLengths.filter(
      (length, index) => length !== prevUniqueBreakLengths.current[index]
    );
    console.log("changedBreakLengths", changedBreakLengths);
    console.log("해당 비디오 있는지 없는지 검사 : ", [
      ...uniqueBreakLengths,
      ...changedBreakLengths,
    ]);

    uniqueBreakLengths.forEach(async (breakLength) => {
      const key = `${breakLength}min_videos`;
      const videos = localStorage.getItem(key);
      if (videos === "{}" || !videos) {
        console.log(key, "localstorage에 비디오 없음, firestore에서 가져오기");
        // const videosFromFirestore = mockVideos;
        const videosFromFirestore = await getVideosFromFirestore(key);
        if (videosFromFirestore && videosFromFirestore.length > 0) {
          console.log("firestore에서 가져온", key, " : ", videosFromFirestore);
          localStorage.setItem(key, JSON.stringify(videosFromFirestore));
          setGotNewVideoFromFirestore(true);
        } else {
          console.log("firestore에 해당 비디오 없음");
        }
      } else {
        console.log("localStorage에서", key, " 가져옴");
      }
    });

    prevUniqueBreakLengths.current = uniqueBreakLengths;
  }, [uniqueBreakLengths]);

  const handleStartNextTimer = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  return (
    <div className="relative">
      <main className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          <h4 className="text-lg bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent">
            Session Length
          </h4>
          <div className="flex items-center gap-2">
            <select
              value={sessionLength}
              onChange={handleSessionLengthChange}
              className="bg-white text-[#EF4168] w-12 mx-1 px-1 py-1 rounded-md shadow-md cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                    defaultValue={sessionLength}
                  >
                    {value}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="text-lg bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent">
            Break Length
          </h4>
          <div className="flex items-center gap-2">
            <select
              onChange={handleBreakLengthChange}
              value={breakLength}
              className="bg-white text-[#EF4168] w-12 mx-1 px-1 py-1 rounded-md shadow-md cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map(
                (value) => (
                  <option key={value} value={value} defaultValue={breakLength}>
                    {value}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="text-lg bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent">
            Pomos
          </h4>
          <div className="flex items-center gap-2">
            <select
              onChange={handlePomoCountChange}
              value={pomoCount}
              className="bg-white text-[#EF4168] w-12 mx-1 px-1 py-1 rounded-md shadow-md cursor-pointer"
            >
              {Array.from([
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
              ]).map((value) => (
                <option key={value} value={value} defaultValue={pomoCount}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="text-lg bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent">
            Completed
          </h4>
          {activeStep}
        </div>

        <div className="flex flex-col items-center">
          <FormProvider {...methods}>
            <Stepper activeStep={activeStep} orientation={"vertical"}>
              {fields.map((field, index) => (
                <Step
                  key={field.id}
                  active={index === activeStep}
                  className="rounded-lg shadow-lg px-4 bg-white"
                >
                  <StepLabel
                    sx={{
                      ".MuiSvgIcon-root": {
                        display: "none",
                      },
                    }}
                  >
                    <Timer
                      index={index}
                      sendNotification={sendNotification}
                      handleOpenVideo={handleOpenVideo}
                      pomoCount={pomoCount}
                      isActiveStep={index === activeStep}
                      startNextTimer={handleStartNextTimer}
                      gotNewVideoFromFirestore={gotNewVideoFromFirestore}
                      setGotNewVideoFromFirestore={setGotNewVideoFromFirestore}
                    />
                  </StepLabel>

                  {/* <StepContent>this only opens for activeStep</StepContent> */}
                </Step>
              ))}
            </Stepper>
          </FormProvider>
        </div>
      </main>

      {/* <projects /> */}

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

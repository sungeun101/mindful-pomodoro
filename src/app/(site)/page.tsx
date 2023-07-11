// "use client";

// import Image from "next/image";
// import { useState, useEffect, useRef, useMemo } from "react";
// import Snackbar from "@mui/material/Snackbar";
// import MuiAlert from "@mui/material/Alert";
// import {
//   FormProvider,
//   useFieldArray,
//   useForm,
//   useWatch,
// } from "react-hook-form";
// import { IYoutubeVideo } from "@/types";
// import VideoDialog from "@/components/VideoDialog";
// import { initFirebase } from "./firebase";
// import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { collection, getDocs, getFirestore } from "@firebase/firestore";
// import Timer from "@/components/Timer";
// import Stepper from "@mui/material/Stepper";
// import Step from "@mui/material/Step";
// import StepLabel from "@mui/material/StepLabel";
// import StepContent from "@mui/material/StepContent";
// import { mockVideos } from "./mockData";
// import { FirebaseError } from "firebase/app";
// import { getProjects } from "../../sanity/lib/client";

// export interface FormData {
//   pomos: {
//     sessionLength: number;
//     breakLength: number;
//   }[];
// }

// export default function Home() {
//   const projects = getProjects();
//   console.log(projects);

//   const app = initFirebase();
//   const provider = new GoogleAuthProvider();
//   const auth = getAuth();
//   const [user, loading] = useAuthState(auth);
//   const db = getFirestore(app);

//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const [notificationMssage, setNotificationMessage] = useState<string | null>(
//     null
//   );
//   const [selectedVideo, setSelectedVideo] = useState<IYoutubeVideo | null>(
//     null
//   );
//   const [pomoCount, setPomoCount] = useState(6);
//   const [sessionLength, setSessionLength] = useState(25);
//   const [breakLength, setBreakLength] = useState(5);
//   const [activeStep, setActiveStep] = useState(0);
//   const [gotNewVideoFromFirestore, setGotNewVideoFromFirestore] =
//     useState(false);

//   const defaultPomos = useMemo(() => {
//     const pomos = [];
//     for (let i = 0; i < pomoCount; i++) {
//       console.log("sessionLength", sessionLength, "breakLength", breakLength);
//       pomos.push({
//         sessionLength,
//         breakLength,
//       });
//     }
//     return pomos;
//   }, [breakLength, pomoCount, sessionLength]);

//   const methods = useForm<FormData>({
//     defaultValues: {
//       pomos: defaultPomos,
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control: methods.control,
//     name: "pomos",
//   });

//   useEffect(() => {
//     if (typeof window !== "undefined" && window.localStorage) {
//       setPomoCount(parseInt(localStorage.getItem("defaultPomoCount") || "6"));
//       setSessionLength(
//         parseInt(localStorage.getItem("defaultSessionLength") || "25")
//       );
//       setBreakLength(
//         parseInt(localStorage.getItem("defaultBreakLength") || "5")
//       );
//       const updatedPomos = methods.getValues("pomos").map((pomo: any) => ({
//         ...pomo,
//         sessionLength: parseInt(
//           localStorage.getItem("defaultSessionLength") ||
//             sessionLength.toString()
//         ),
//         breakLength: parseInt(
//           localStorage.getItem("defaultBreakLength") || breakLength.toString()
//         ),
//       }));
//       methods.setValue("pomos", updatedPomos);
//     }
//   }, []);

//   const handleSessionLengthChange = (event: { target: { value: string } }) => {
//     const selectedValue = parseInt(event.target.value, 10);
//     setSessionLength(selectedValue);
//     localStorage.setItem("defaultSessionLength", selectedValue.toString());
//     // Update the sessionLength value for all pomos in the form data
//     const updatedPomos = methods.getValues("pomos").map((pomo: any) => ({
//       ...pomo,
//       sessionLength: selectedValue,
//     }));
//     methods.setValue("pomos", updatedPomos);
//   };

//   const handleBreakLengthChange = (event: { target: { value: string } }) => {
//     const selectedValue = parseInt(event.target.value, 10);
//     setBreakLength(selectedValue);
//     localStorage.setItem("defaultBreakLength", selectedValue.toString());
//     // Update the breakLength value for all pomos in the form data
//     const updatedPomos = methods.getValues("pomos").map((pomo: any) => ({
//       ...pomo,
//       breakLength: selectedValue,
//     }));
//     methods.setValue("pomos", updatedPomos);
//   };

//   const handlePomoCountChange = (event: { target: { value: string } }) => {
//     console.log("newPomoCount", event.target.value);
//     const newPomoCount = parseInt(event.target.value);
//     setPomoCount(newPomoCount);
//     localStorage.setItem("defaultPomoCount", newPomoCount.toString());
//   };

//   useEffect(() => {
//     if (pomoCount > fields.length) {
//       // Add pomos
//       const diff = pomoCount - fields.length;
//       for (let i = 0; i < diff; i++) {
//         append({
//           sessionLength,
//           breakLength,
//         });
//       }
//     } else if (pomoCount < fields.length) {
//       // Remove pomos
//       const diff = fields.length - pomoCount;
//       for (let i = 0; i < diff; i++) {
//         remove(fields.length - 1);
//       }
//     }
//   }, [pomoCount, fields]);

//   const signIn = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       console.log(result.user);
//     } catch (error) {
//       if ((error as FirebaseError).code === "auth/popup-closed-by-user") {
//         // User closed the sign-in popup
//         console.log("Sign-in popup closed by user");
//       } else {
//         // Other authentication errors
//         console.error("Sign-in error:", error);
//       }
//     }
//   };

//   const logout = async () => {
//     await auth.signOut();
//   };

//   const getVideosFromFirestore = async (collectionName: string) => {
//     // get from firestore because matching localStorage data is empty
//     const querySnapshot = await getDocs(collection(db, collectionName));
//     const videos: any[] = [];
//     querySnapshot.forEach((doc) => {
//       videos.push(doc.data());
//     });
//     return videos;
//   };

//   const handleNotificationClose = () => {
//     setNotificationMessage(null);
//   };

//   const sendNotification = ({
//     message,
//     audio,
//   }: {
//     message: string;
//     audio: string;
//   }) => {
//     setNotificationMessage(message);
//     audioRef.current = new Audio(audio);
//     audioRef.current?.play();
//   };

//   const handleOpenVideo = (video: IYoutubeVideo) => {
//     setSelectedVideo(video);
//   };

//   const breakLengths = useWatch({
//     name: "pomos",
//     control: methods.control,
//   }).map((pomo) => pomo.breakLength);

//   const uniqueBreakLengths = breakLengths.filter(
//     (value, index, self) => self.indexOf(value) === index
//   );
//   console.log("uniqueBreakLengths", uniqueBreakLengths);

//   const prevUniqueBreakLengths = useRef(uniqueBreakLengths);

//   useEffect(() => {
//     const changedBreakLengths = uniqueBreakLengths.filter(
//       (length, index) => length !== prevUniqueBreakLengths.current[index]
//     );
//     console.log("changedBreakLengths", changedBreakLengths);
//     console.log("해당 비디오 있는지 없는지 검사 : ", [
//       ...uniqueBreakLengths,
//       ...changedBreakLengths,
//     ]);

//     uniqueBreakLengths.forEach(
//       // [...uniqueBreakLengths, ...changedBreakLengths].
//       async (breakLength) => {
//         const key = `${breakLength}min_videos`;
//         const videos = localStorage.getItem(key);
//         if (videos === "{}" || !videos) {
//           console.log(
//             key,
//             "localstorage에 비디오 없음, firestore에서 가져오기"
//           );
//           // const videosFromFirestore = mockVideos;
//           const videosFromFirestore = await getVideosFromFirestore(key);
//           if (videosFromFirestore && videosFromFirestore.length > 0) {
//             console.log(
//               "firestore에서 가져온",
//               key,
//               " : ",
//               videosFromFirestore
//             );
//             localStorage.setItem(key, JSON.stringify(videosFromFirestore));
//             setGotNewVideoFromFirestore(true);
//           } else {
//             console.log("firestore에 해당 비디오 없음");
//           }
//         } else {
//           console.log("localStorage에서", key, " 가져옴");
//         }
//       }
//     );

//     prevUniqueBreakLengths.current = uniqueBreakLengths;
//   }, [uniqueBreakLengths]);

//   const handleStartNextTimer = () => {
//     setActiveStep((prevStep) => prevStep + 1);
//   };

//   return (
//     <div className="relative bg-white text-[#1F1B2E] font-mono  py-28">
//       {/* Top navigation */}
//       <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
//         <div className="flex items-center px-4 py-2">
//           <div>
//             <Image
//               src="/logo.png"
//               alt="Pomodoro Logo"
//               width={100}
//               height={24}
//               priority
//             />
//           </div>
//           <div className="flex items-center space-x-4 ml-auto">
//             {user ? (
//               <div className="flex items-center space-x-2">
//                 {user.photoURL && (
//                   <Image
//                     src={user.photoURL}
//                     alt="User Profile"
//                     width={28}
//                     height={28}
//                     className="rounded-full"
//                   />
//                 )}
//                 <span>{user.displayName}</span>
//                 <button
//                   onClick={logout}
//                   className="border border-[#EF4168] text-[#EF4168]  rounded-md px-2 h-10 shadow-sm"
//                 >
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={signIn}
//                 className="border border-[#EF4168] text-[#EF4168]  rounded-md px-2 h-10 shadow-sm"
//               >
//                 Login
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       <main className="flex flex-col gap-4">
//         <div className="flex flex-col items-center">
//           <h4 className="text-gray-500">Session Length</h4>
//           <div className="flex items-center gap-2">
//             <select value={sessionLength} onChange={handleSessionLengthChange}>
//               {Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map(
//                 (value) => (
//                   <option
//                     key={value}
//                     value={value}
//                     defaultValue={sessionLength}
//                   >
//                     {value}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>
//         </div>

//         <div className="flex flex-col items-center">
//           <h4 className="text-gray-500">Break Length</h4>
//           <div className="flex items-center gap-2">
//             <select onChange={handleBreakLengthChange} value={breakLength}>
//               {Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map(
//                 (value) => (
//                   <option key={value} value={value} defaultValue={breakLength}>
//                     {value}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>
//         </div>

//         <div className="flex flex-col items-center">
//           <h4 className="text-gray-500">Pomos</h4>
//           <div className="flex items-center gap-2">
//             <select onChange={handlePomoCountChange} value={pomoCount}>
//               {Array.from([
//                 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
//               ]).map((value) => (
//                 <option key={value} value={value} defaultValue={pomoCount}>
//                   {value}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="flex flex-col items-center">
//           <h4 className="text-gray-500">Completed</h4>
//           {activeStep}
//         </div>

//         <div className="flex flex-col items-center">
//           <FormProvider {...methods}>
//             <Stepper activeStep={activeStep} orientation={"vertical"}>
//               {fields.map((field, index) => (
//                 <Step
//                   key={field.id}
//                   active={index === activeStep}
//                   className="rounded-lg shadow-lg p-4"
//                 >
//                   <StepLabel
//                     sx={{
//                       ".MuiSvgIcon-root": {
//                         display: "none",
//                       },
//                     }}
//                   >
//                     <Timer
//                       index={index}
//                       sendNotification={sendNotification}
//                       handleOpenVideo={handleOpenVideo}
//                       pomoCount={pomoCount}
//                       isActiveStep={index === activeStep}
//                       startNextTimer={handleStartNextTimer}
//                       gotNewVideoFromFirestore={gotNewVideoFromFirestore}
//                       setGotNewVideoFromFirestore={setGotNewVideoFromFirestore}
//                     />
//                   </StepLabel>

//                   {/* <StepContent>this only opens for activeStep</StepContent> */}
//                 </Step>
//               ))}
//             </Stepper>
//           </FormProvider>
//         </div>
//       </main>

//       {/* <projects /> */}

//       <VideoDialog video={selectedVideo} setVideo={setSelectedVideo} />

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={Boolean(notificationMssage)}
//         autoHideDuration={5000}
//         onClose={handleNotificationClose}
//       >
//         <MuiAlert
//           elevation={6}
//           variant="filled"
//           onClose={handleNotificationClose}
//           severity="success"
//           sx={{ backgroundColor: "#EF4168", color: "white" }}
//         >
//           {notificationMssage}
//         </MuiAlert>
//       </Snackbar>
//     </div>
//   );
// }

import React from "react";
import { getProjects } from "../../../sanity/utils/project";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const projects = await getProjects();
  console.log(projects);
  return (
    <div>
      <h1 className="text-7xl font-extrabold">
        Welcome to
        <span className="bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent">
          {" "}
          Pomodoro Yoga
        </span>
      </h1>
      <p className="mt-3 text-xl text-gray-600 dark:text-white">
        Optimize your work intervals, taking breaks to engage in mindful yoga
        poses, stretching, or breathing exercises.
      </p>
      <h2 className="mt-24 font-bold text-gray-700 dark:text-white text-3xl">
        Tips for Getting Started
      </h2>

      <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link
            href={`/projects/${project.slug}`}
            key={project._id}
            className="border-2 border-gray-500 rounded-lg p-1 hover:scale-105 hover:border-blue-500 transition"
          >
            {project.image && (
              <Image
                src={project.image}
                alt={project.name}
                width={750}
                height={300}
                className="object-cover rounded-lg border border-gray-500"
              />
            )}
            <div className="mt-2 font-extrabold bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent">
              {project.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

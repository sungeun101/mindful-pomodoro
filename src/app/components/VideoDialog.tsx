import { IYoutubeVideo } from "@/types/Video";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  PaperProps,
} from "@mui/material";
import React from "react";
import Draggable from "react-draggable";
import he from "he";

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export default function VideoDialog({
  video,
  setVideo,
}: {
  video: IYoutubeVideo | null;
  setVideo: React.Dispatch<React.SetStateAction<IYoutubeVideo | null>>;
}) {
  const handleClose = () => {
    setVideo(null);
  };

  return (
    <Dialog
      open={Boolean(video)}
      onClose={handleClose}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      fullWidth
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {he.decode(video?.snippet.title || "")}
      </DialogTitle>
      <DialogContent>
        <iframe
          src={`https://www.youtube.com/embed/${video?.id.videoId}?autoplay=1&mute=1`}
          title="YouTube video player"
          allow="autoplay"
          allowFullScreen
          className="w-full aspect-video rounded-xl overflow-hidden"
        ></iframe>
        {/* <DialogContentText>
          To subscribe to this website, please enter your email address here. We
          will send updates occasionally.
        </DialogContentText> */}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Cancel
        </Button>
        {/* <Button onClick={}>Save</Button> */}
      </DialogActions>
    </Dialog>
  );
}

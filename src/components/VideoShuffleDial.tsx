import SpeedDial from "@mui/material/SpeedDial";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ReplayIcon from "@mui/icons-material/Replay";
import { useState } from "react";
import { SpeedDialAction } from "@mui/material";

export default function VideoShuffleDial({
  getBreakVideos,
  resetTimer,
}: {
  getBreakVideos: () => void;
  resetTimer: () => void;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const actions: any[] = [
    // { icon: <ReplayIcon />, name: "Reset", onClick: resetTimer },
    // { icon: <SaveIcon />, name: "Save" },
    // { icon: <PrintIcon />, name: "Print" },
    // { icon: <ShareIcon />, name: "Share" },
  ];
  return (
    <SpeedDial
      ariaLabel="SpeedDial tooltip"
      sx={{ position: "absolute", top: -50, right: -30, zIndex: 10000 }}
      icon={<ShuffleIcon />}
      onClick={getBreakVideos}
      // onClose={handleClose}
      // onOpen={handleOpen}
      // open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={handleClose}
        />
      ))}
    </SpeedDial>
  );
}

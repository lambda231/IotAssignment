"use client";

import { forwardRef, useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import Collapse from "@mui/material/Collapse";

type AlarmCardProps = {
  visible: boolean;
  message: string;
};

const AlarmCard = forwardRef<HTMLDivElement, AlarmCardProps>(
  ({ visible, message }, ref) => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    useEffect(() => {
      if (visible) setCurrentTime(new Date());
    }, [visible]);
    return (
      <Collapse
        orientation="horizontal"
        in={visible}
        mountOnEnter
        unmountOnExit
        className="shrink-0"
      >
        <div className="flex flex-row items-center gap-x-3 h-full pl-2 p-4 bg-yellow-100 text-yellow-900  border-2 border-yellow-800 rounded shadow-md">
          <TriangleAlert size={58} className="flex-none shrink-0" />
          <div className="flex flex-col items-start justify-center w-full text-yellow-900 flex-none shrink-0">
            <span className="text-xl font-semibold">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span>{message}</span>
          </div>
        </div>
      </Collapse>
    );
  }
);

export default AlarmCard;

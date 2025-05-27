"use client";

import { forwardRef, useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import Collapse from "@mui/material/Collapse";

type AlarmCardProps = {
  visible: boolean;
  message: string;
};

const AlarmItem = forwardRef<HTMLDivElement, AlarmCardProps>(
  ({ visible, message }, ref) => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    useEffect(() => {
      if (visible) setCurrentTime(new Date());
    }, [visible]);
    return (
      <Collapse
        orientation="vertical"
        in={visible}
        mountOnEnter
        unmountOnExit
        className="w-full"
      >
        <div className="flex flex-row items-center gap-x-3 h-full pl-2 p-4 bg-yellow-100 text-yellow-900 border-2 border-yellow-800 rounded shadow-md">
          <div className="flex flex-col items-start justify-center w-full text-yellow-900 ">
            <span className="text-xl font-semibold ">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className="">{message}</span>
          </div>
          <TriangleAlert size={58} className="flex-none shrink-0" />
        </div>
      </Collapse>
    );
  }
);

export default AlarmItem;

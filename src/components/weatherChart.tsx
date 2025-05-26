"use client";

import React, { useEffect, useState, useRef } from "react";
import { LineChart, LineChartProps } from "@mui/x-charts";

export interface SeriesData {
  id: string;
  values: number[];
  label?: string;
  color?: string;
  type?: string;
}

interface WeatherChartProps {
  data: SeriesData[]; // all series to display
  timestamp: string[]; // common x-axis values
  maxDisplay: number; // max number of recent points to show
  tickMs: number; // time interval in milliseconds for each tick
  className?: string;
  height?: number; // optional height for the chart
  width?: number; // optional width for the chart
}

const WeatherChart: React.FC<WeatherChartProps> = ({
  data,
  timestamp,
  maxDisplay,
  tickMs,
  className = "",
  height,
  width,
}) => {
  const [visibleTimes, setVisibleTimes] = useState<string[]>([]);
  const [series, setSeries] = useState<LineChartProps["series"]>([]);

  useEffect(() => {
    const start = Math.max(0, timestamp.length - maxDisplay);

    const slicedTimestamps = timestamp.slice(start);
    const missingCount = Math.max(0, maxDisplay - slicedTimestamps.length);

    const dateFormatter = Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const generatePaddedTimestamps = (): string[] => {
      const padded: string[] = [];

      if (slicedTimestamps.length !== maxDisplay) {
        if (slicedTimestamps.length === 0) {
          const now = new Date(); // ⬅️ Current time is the base

          for (let i = 0; i < maxDisplay; i++) {
            const pastTime = new Date(now.getTime() + (i + 1) * tickMs);
            padded.push(dateFormatter.format(pastTime));
            // padded.push("");
          }

          return padded;
        }

        // Parse "HH:MM:SS"
        const [h, m, s] = slicedTimestamps[0].split(":").map(Number);
        const baseTime = new Date();
        baseTime.setHours(h, m, s, 0);

        for (let i = 0; i < maxDisplay; i++) {
          const pastTime = new Date(baseTime.getTime() + i * tickMs);
          padded.push(dateFormatter.format(pastTime));
          // padded.push("");
        }

        return padded;
      } else {
        return slicedTimestamps;
      }
    };

    setVisibleTimes(generatePaddedTimestamps());

    const series = data.map((seriesItem, index) => {
      const sliced = seriesItem.values.slice(start);
      const padded = sliced.concat(Array(missingCount).fill(null)); // pad with nulls
      // const padded = sliced;
      return {
        id: seriesItem.id,
        label: seriesItem.label || seriesItem.id,
        data: padded,
        color: seriesItem.color || "#000000",
        showMark: false,
        connectNulls: false,
      };
    });
    setSeries(series);
  }, [timestamp.length, maxDisplay]);

  return (
    <LineChart
      className={className}
      skipAnimation
      width={width ? width : undefined}
      height={height ? height : undefined}
      series={series}
      xAxis={[
        {
          scaleType: "point",
          data: visibleTimes,
          label: "Time",
          valueFormatter: (value) => value.toString(),
        },
      ]}
      grid={{ vertical: true, horizontal: true }}
    />
  );
};

export default WeatherChart;

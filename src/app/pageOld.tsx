"use client";

import React from "react";
import WeatherChartOld from "@/components/weatherChart";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import { useState } from "react";

const VisxChart = () => {
  const [sensor, setSensor] = useState<number>(0);
  const sensors = ["sensorA", "sensorB", "sensorC", "sensorD"];
  // Mock time-based data (e.g., hourly)
  const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

  // Corresponding temperature and humidity readings
  const data = [
    {
      temperature: [15, 16, 18, 19, 21, 22],
      humidity: [72, 70, 68, 67, 65, 64],
    },
    {
      temperature: [14, 15, 17, 18, 20, 21],
      humidity: [75, 73, 70, 69, 67, 66],
    },
    {
      temperature: [16, 17, 19, 21, 23, 24],
      humidity: [68, 66, 64, 62, 60, 58],
    },
    {
      temperature: [13, 14, 15, 17, 19, 20],
      humidity: [78, 76, 74, 72, 70, 68],
    },
  ];

  return (
    <main className="flex flex-col bg-white p-5 h-screen w-full">
      <div className="mb-4">
        <ButtonGroup variant="contained" aria-label="Basic button group">
          {sensors.map((val, idx) => (
            <Button
              onClick={(e) => {
                setSensor(idx);
              }}
            >
              {val}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="flex flex-row">
        <div className="grid grid-cols-1 justify-items-center w-[50%] max-w-80 gap-y-2">
          <div className="w-full border-2 rounded-[20px] border-gray-300 shadow-md">
            {/* Gradient: Blue (cold) → Red (hot) → Yellow */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient
                  id="tempGradient"
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                >
                  <stop offset="0%" stopColor="#2196f3" /> {/* Blue (cold) */}
                  <stop offset="50%" stopColor="#f44336" /> {/* Red (hot) */}
                  <stop offset="100%" stopColor="#ffeb3b" /> {/* Yellow */}
                </linearGradient>
              </defs>
            </svg>

            <div className="grid grid-cols-1 justify-items-center relative">
              <Gauge
                value={
                  data[sensor].temperature[data[sensor].temperature.length - 1]
                }
                startAngle={-90}
                endAngle={90}
                innerRadius="60%"
                outerRadius="100%"
                sx={(theme) => ({
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 40,
                    transform: "translate(0px, -20px)",
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: "url(#tempGradient)",
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: "#eeeeee",
                  },
                })}
                text={({ value, valueMax }) => `${value}°C`}
              />
              <p className="text-black text-2xl relative pt-0">Temperature</p>
            </div>
          </div>

          <div className="w-full border-2 rounded-[20px] border-gray-300 shadow-md">
            {/* Gradient: Dry → Normal → Humid */}
            <svg width="0" height="0">
              <defs>
                <linearGradient
                  id="humidityGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="20%" stopColor="#a1887f" />{" "}
                  {/* Brownish: Dry */}
                  <stop offset="50%" stopColor="#81d4fa" />{" "}
                  {/* Light blue: Normal */}
                  <stop offset="100%" stopColor="#1565c0" />{" "}
                  {/* Deep blue: Humid */}
                </linearGradient>
              </defs>
            </svg>

            <div className="w-full grid grid-cols-1 justify-items-center relative">
              <Gauge
                value={data[sensor].humidity[data[sensor].humidity.length - 1]}
                startAngle={-90}
                endAngle={90}
                innerRadius="60%"
                outerRadius="100%"
                sx={(theme) => ({
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 40,
                    transform: "translate(0px, -20px)",
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: "url(#humidityGradient)",
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: "#eeeeee",
                  },
                })}
                text={({ value, valueMax }) => `${value}%`}
              />
              <p className="text-black text-2xl relative pt-0">Humidity</p>
            </div>
          </div>
        </div>

        <WeatherChartOld
          sensorId={sensor}
          data={data}
          className="w-full max-w-4xl max-h-96 border-2 rounded-[20px] border-gray-300 shadow-md"
        />
      </div>
    </main>
  );
};

export default VisxChart;

"use client";

import React from "react";
import WeatherChart from "@/components/weatherChart";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

const VisxChart = () => {
  // Mock time-based data (e.g., hourly)
  const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

  // Corresponding temperature and humidity readings
  const temperature = [15, 17, 18, 20, 22, 100]; // Celsius
  const humidity = [70, 68, 65, 63, 60, 100]; // Percent

  return (
    <main className="flex flex-row bg-white p-5 h-screen">
      <svg width="0" height="0">
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#2196f3" /> {/* Blue (cold) */}
            <stop offset="50%" stopColor="#f44336" /> {/* Red (hot) */}
            <stop offset="100%" stopColor="#ffeb3b" /> {/* Yellow */}
          </linearGradient>
        </defs>
      </svg>

      <div className="w-full grid grid-cols-1 justify-items-center relative">
        <Gauge
          value={temperature[temperature.length - 1]}
          startAngle={-90}
          endAngle={90}
          innerRadius="60%"
          outerRadius="100%"
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 40,
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
        <p className="text-black text-2xl absolute pt-85">Temperature</p>
      </div>

      <WeatherChart />

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
            <stop offset="20%" stopColor="#a1887f" /> {/* Brownish: Dry */}
            <stop offset="50%" stopColor="#81d4fa" /> {/* Light blue: Normal */}
            <stop offset="100%" stopColor="#1565c0" /> {/* Deep blue: Humid */}
          </linearGradient>
        </defs>
      </svg>
      <div className="w-full grid grid-cols-1 justify-items-center relative">
        <Gauge
          value={humidity[humidity.length - 1]}
          startAngle={-90}
          endAngle={90}
          innerRadius="60%"
          outerRadius="100%"
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 40,
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
        <p className="text-black text-2xl absolute pt-85">Humidity</p>
      </div>
    </main>
  );
};

export default VisxChart;

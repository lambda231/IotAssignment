"use client";

import React from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { NumberInput } from "@heroui/react";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { TriangleAlert, Settings } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

import { SensorData } from "@/type/sensor";
import WeatherChart from "@/components/weatherChart";
import { get } from "http";

interface RawRow {
  [key: string]: string;
}

const Page = () => {
  const initialData: SensorData = {
    temperature: [],
    humidity: [],
    co2: [],
    tvoc: [],
    timestamp: [],
  };
  const [data, setData] = useState<SensorData>(initialData);
  const fullDataRef = useRef<RawRow[]>([]);
  const indexRef = useRef(0);
  const effectRan = useRef(false);
  const delayMs = 1000;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [tempMin, setTempMin] = useState<number | null>(null);
  const [tempMax, setTempMax] = useState<number | null>(null);
  const [humidityMin, setHumidityMin] = useState<number | null>(null);
  const [humidityMax, setHumidityMax] = useState<number | null>(null);
  const [co2Min, setCo2Min] = useState<number | null>(null);
  const [co2Max, setCo2Max] = useState<number | null>(null);
  const [tvocMin, setTvocMin] = useState<number | null>(null);
  const [tvocMax, setTvocMax] = useState<number | null>(null);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    fetch("/indoor_climate.csv")
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse<RawRow>(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        if (parsed.data && Array.isArray(parsed.data)) {
          fullDataRef.current = parsed.data;
        }

        const interval = setInterval(() => {
          const next = fullDataRef.current[indexRef.current];
          if (next) {
            const newTimestamp = new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });

            setData((prev) => ({
              temperature: [
                ...prev.temperature,
                parseFloat(next["Temperature (?C)"] || "0"),
              ],
              humidity: [
                ...prev.humidity,
                parseFloat(next["Humidity (%)"] || "0"),
              ],
              co2: [...prev.co2, parseFloat(next["CO2 (ppm)"] || "0")],
              tvoc: [...prev.tvoc, parseFloat(next["TVOC (ppb)"] || "0")],
              timestamp: [...prev.timestamp, newTimestamp],
            }));

            indexRef.current += 1;
          } else {
            clearInterval(interval);
          }
        }, delayMs);

        return () => clearInterval(interval);
      });
  }, []);

  function getTemperatureColor(value: number): string {
    if (value <= 0) return "#2196f3"; // Blue
    if (value <= 15) return "#4caf50"; // Green
    if (value <= 25) return "#ffeb3b"; // Yellow
    if (value <= 35) return "#ff9800"; // Orange
    return "#f44336"; // Red
  }

  function getHumidityColor(value: number): string {
    if (value < 30) return "#f44336"; // Red
    if (value <= 50) return "#4caf50"; // Green
    if (value <= 70) return "#ffeb3b"; // Yellow
    return "#2196f3"; // Blue
  }

  function getCO2Color(value: number): string {
    if (value <= 600) return "#2ecc71";
    if (value <= 1000) return "#f1c40f";
    if (value <= 1500) return "#e67e22";
    if (value <= 2000) return "#e74c3c";
    return "#8e44ad";
  }

  function getTVOCColor(value: number): string {
    if (value <= 150) return "#2ecc71";
    if (value <= 300) return "#f1c40f";
    if (value <= 500) return "#e67e22";
    if (value <= 1000) return "#e74c3c";
    return "#8e44ad";
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <HeroUIProvider>
      <Card>
        <CardBody>
          <p>Make beautiful websites regardless of your design experience.</p>
        </CardBody>
      </Card>
      <main className="flex flex-col gap-y-2 p-4">
        <div className="w-full h-16 border-2 border-gray-300">
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            className="flex flex-row gap-x-2 p-2"
            onClick={handleClick}
          >
            <Settings /> Alarm Setting
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            className="w-full"
          >
            <MenuItem>
              <div className="grid grid-cols-1">
                <div className="flex flex-row items-center">
                  <span className="w-80">Temperature safe range (°C): </span>
                  <div className="flex flex-row gap-x-2 w-full items-center">
                    <NumberInput
                      id="tempMin"
                      className="h-full w-full"
                      placeholder="Not set"
                      step={0.01}
                      onChange={(value) => {
                        setTempMin(Number(value));
                      }}
                    />
                    <span>-</span>
                    <NumberInput
                      id="tempMax"
                      placeholder="Not set"
                      step={0.01}
                      onChange={(value) => {
                        setTempMax(Number(value));
                      }}
                    />{" "}
                  </div>
                </div>
              </div>
            </MenuItem>
            <MenuItem>
              <div className="grid grid-cols-1">
                <div className="flex flex-row items-center">
                  <span className="w-80"> Humidity safe range (%): </span>
                  <div className="flex flex-row gap-x-2 w-full items-center">
                    <NumberInput
                      id="humidityMin"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={100}
                      onChange={(value) => {
                        setHumidityMin(Number(value));
                      }}
                    />{" "}
                    <span>-</span>{" "}
                    <NumberInput
                      id="humidityMax"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={100}
                      onChange={(value) => {
                        setHumidityMax(Number(value));
                      }}
                    />{" "}
                  </div>
                </div>
              </div>
            </MenuItem>
            <MenuItem>
              <div className="grid grid-cols-1">
                <div className="flex flex-row items-center">
                  <span className="w-80"> CO2 safe range (ppm): </span>
                  <div className="flex flex-row gap-x-2 w-full items-center">
                    <NumberInput
                      id="co2Min"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      onChange={(value) => {
                        setCo2Min(Number(value));
                      }}
                    />{" "}
                    <span>-</span>{" "}
                    <NumberInput
                      id="co2Max"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      onChange={(value) => {
                        setCo2Max(Number(value));
                      }}
                    />{" "}
                  </div>
                </div>
              </div>
            </MenuItem>
            <MenuItem>
              <div className="grid grid-cols-1">
                <div className="flex flex-row items-center">
                  <span className="w-80"> TVOC safe range (ppb):</span>
                  <div className="flex flex-row gap-x-2 w-full items-center">
                    <NumberInput
                      id="tvocMin"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      onChange={(value) => {
                        setTvocMin(Number(value));
                      }}
                    />{" "}
                    <span>-</span>{" "}
                    <NumberInput
                      id="tvocMax"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      onChange={(value) => {
                        setTvocMax(Number(value));
                      }}
                    />{" "}
                  </div>
                </div>
              </div>
            </MenuItem>
          </Menu>
        </div>

        <div className="flex flex-col lg:flex-row w-full gap-3 ">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-1 justify-items-center sm:max-w-80 gap-2">
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
                      <stop offset="0%" stopColor="#2196f3" />{" "}
                      {/* Blue (cold) */}
                      <stop offset="50%" stopColor="#f44336" />{" "}
                      {/* Red (hot) */}
                      <stop offset="100%" stopColor="#ffeb3b" /> {/* Yellow */}
                    </linearGradient>
                  </defs>
                </svg>

                <div className="grid grid-cols-1 justify-items-center relative">
                  <Gauge
                    value={
                      data.temperature.length > 0
                        ? data.temperature[data.temperature.length - 1]
                        : 0
                    }
                    valueMax={50}
                    startAngle={-90}
                    endAngle={90}
                    innerRadius="60%"
                    outerRadius="100%"
                    sx={(theme) => ({
                      [`& .${gaugeClasses.valueText}`]: {
                        fontSize: 32,
                        transform: "translate(0px, -20px)",
                      },
                      [`& .${gaugeClasses.valueArc}`]: {
                        // fill: "url(#tempGradient)",
                        // fill: getTemperatureColor(
                        //   data.temperature.length > 0
                        //     ? data.temperature[data.temperature.length - 1]
                        //     : 0
                        // ),
                        fill: "#ff5722",
                      },
                      [`& .${gaugeClasses.referenceArc}`]: {
                        fill: "#eeeeee",
                      },
                    })}
                    text={({ value, valueMax }) => `${value}°C`}
                  />
                  <p className="text-black text-2xl relative pt-0">
                    Temperature
                  </p>
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
                    value={
                      data.humidity.length > 0
                        ? data.humidity[data.humidity.length - 1]
                        : 0
                    }
                    startAngle={-90}
                    endAngle={90}
                    innerRadius="60%"
                    outerRadius="100%"
                    sx={(theme) => ({
                      [`& .${gaugeClasses.valueText}`]: {
                        fontSize: 32,
                        transform: "translate(0px, -20px)",
                      },
                      [`& .${gaugeClasses.valueArc}`]: {
                        // fill: "url(#humidityGradient)",
                        // fill: getHumidityColor(
                        //   data.humidity.length > 0
                        //     ? data.humidity[data.humidity.length - 1]
                        //     : 0
                        // ),
                        fill: "#2196f3",
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

            <div className="w-full max-w-4xl max-h-96 border-2 rounded-[20px] border-gray-300 shadow-md">
              <WeatherChart
                height={350}
                className="h-full"
                data={[
                  {
                    id: `temp`,
                    label: `Temp (°C)`,
                    values: data.temperature,
                    color: "#ff5722",
                  },
                  {
                    id: `humidity`,
                    label: `Humidity (%)`,
                    values: data.humidity,
                    color: "#2196f3",
                  },
                ]}
                timestamp={data.timestamp}
                maxDisplay={10}
                tickMs={delayMs}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-1  justify-items-center sm:max-w-80 gap-2">
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
                      <stop offset="0%" stopColor="#2196f3" />{" "}
                      {/* Blue (cold) */}
                      <stop offset="50%" stopColor="#f44336" />{" "}
                      {/* Red (hot) */}
                      <stop offset="100%" stopColor="#ffeb3b" /> {/* Yellow */}
                    </linearGradient>
                  </defs>
                </svg>

                <div className="grid grid-cols-1 justify-items-center relative">
                  <Gauge
                    value={
                      data.co2.length > 0 ? data.co2[data.co2.length - 1] : 0
                    }
                    startAngle={-90}
                    endAngle={90}
                    valueMax={2000}
                    innerRadius="60%"
                    outerRadius="100%"
                    sx={(theme) => ({
                      [`& .${gaugeClasses.valueText}`]: {
                        fontSize: 24,
                        transform: "translate(0px, -20px)",
                      },
                      [`& .${gaugeClasses.valueArc}`]: {
                        // fill: getCO2Color(
                        //   data.co2.length > 0 ? data.co2[data.co2.length - 1] : 0
                        // ),
                        fill: "#16de6d",
                      },
                      [`& .${gaugeClasses.referenceArc}`]: {
                        fill: "#eeeeee",
                      },
                    })}
                    text={({ value, valueMax }) => `${value} ppm`}
                  />
                  <p className="text-black text-2xl relative pt-0">CO2</p>
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
                    value={
                      data.tvoc.length > 0 ? data.tvoc[data.tvoc.length - 1] : 0
                    }
                    startAngle={-90}
                    endAngle={90}
                    valueMax={1000}
                    valueMin={0}
                    innerRadius="60%"
                    outerRadius="100%"
                    sx={(theme) => ({
                      [`& .${gaugeClasses.valueText}`]: {
                        fontSize: 24,
                        transform: "translate(0px, -20px)",
                      },
                      [`& .${gaugeClasses.valueArc}`]: {
                        // fill: getTVOCColor(
                        //   data.tvoc.length > 0 ? data.tvoc[data.tvoc.length - 1] : 0
                        // ),
                        fill: "#f779e7",
                      },
                      [`& .${gaugeClasses.referenceArc}`]: {
                        fill: "#eeeeee",
                      },
                    })}
                    text={({ value, valueMax }) => `${value} ppb`}
                  />
                  <p className="text-black text-2xl relative pt-0">TVOC</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full max-w-4xl max-h-96 border-2 rounded-[20px] border-gray-300 shadow-md">
              <WeatherChart
                className="h-full"
                height={350}
                data={[
                  {
                    id: `co2`,
                    label: `CO2 (ppm)`,
                    values: data.co2,
                    color: "#16de6d",
                  },
                  {
                    id: `tvoc`,
                    label: `TVOC (ppb)`,
                    values: data.tvoc,
                    color: "#f779e7",
                  },
                ]}
                timestamp={data.timestamp}
                maxDisplay={10}
                tickMs={delayMs}
              />
            </div>
          </div>
        </div>
      </main>
    </HeroUIProvider>
  );
};

export default Page;

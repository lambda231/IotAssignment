"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import { TransitionGroup } from "react-transition-group";

import { InputNumber } from "antd";

import { TriangleAlert, Settings } from "lucide-react";
import AlarmCard from "@/components/alarmCard";
import FlashBox from "@/components/flashBox";
import DraggableScrollContainer from "@/components/draggableScrollContainer";

import { SensorData } from "@/type/sensor";
import WeatherChart from "@/components/weatherChart";
import AlarmItem from "@/components/alarmItem";

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

  const [anchorElAlarm, setAnchorElAlarm] = useState<null | HTMLElement>(null);
  const openAlarm = Boolean(anchorElAlarm);

  const [tempMin, setTempMin] = useState<number | null>(null);
  const tempMinRef = useRef<number | null>(tempMin);
  const [tempMax, setTempMax] = useState<number | null>(null);
  const tempMaxRef = useRef<number | null>(tempMax);
  const [humidityMin, setHumidityMin] = useState<number | null>(null);
  const humidityMinRef = useRef<number | null>(humidityMin);
  const [humidityMax, setHumidityMax] = useState<number | null>(null);
  const humidityMaxRef = useRef<number | null>(humidityMax);
  const [co2Min, setCo2Min] = useState<number | null>(null);
  const co2MinRef = useRef<number | null>(co2Min);
  const [co2Max, setCo2Max] = useState<number | null>(null);
  const co2MaxRef = useRef<number | null>(co2Max);
  const [tvocMin, setTvocMin] = useState<number | null>(null);
  const tvocMinRef = useRef<number | null>(tvocMin);
  const [tvocMax, setTvocMax] = useState<number | null>(null);
  const tvocMaxRef = useRef<number | null>(tvocMax);

  type AlertData = {
    message: string;
    activated: boolean;
  };

  const [alerts, setAlerts] = useState<AlertData[]>([
    { message: "Temperature too low!", activated: false },
    { message: "Temperature too high!", activated: false },
    { message: "Humidity too low!", activated: false },
    { message: "Humidity too high!", activated: false },
    { message: "CO2 too low!", activated: false },
    { message: "CO2 too high!", activated: false },
    { message: "TVOC too low!", activated: false },
    { message: "TVOC too high!", activated: false },
  ]);

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

            const nextTemp = parseFloat(next["Temperature (?C)"] || "0");
            const nextHumidity = parseFloat(next["Humidity (%)"] || "0");
            const nextCo2 = parseFloat(next["CO2 (ppm)"] || "0");
            const nextTvoc = parseFloat(next["TVOC (ppb)"] || "0");
            setData((prev) => ({
              temperature: [...prev.temperature, nextTemp],
              humidity: [...prev.humidity, nextHumidity],
              co2: [...prev.co2, nextCo2],
              tvoc: [...prev.tvoc, nextTvoc],
              timestamp: [...prev.timestamp, newTimestamp],
            }));

            // Check for alarms
            // console.log(
            //   tempMinRef.current,
            //   tempMaxRef.current,
            //   humidityMinRef.current,
            //   humidityMaxRef.current,
            //   co2MinRef.current,
            //   co2MaxRef.current,
            //   tvocMinRef.current,
            //   tvocMaxRef.current
            // );

            const alertActivation = [
              tempMinRef.current !== null && nextTemp < tempMinRef.current,
              tempMaxRef.current !== null && nextTemp > tempMaxRef.current,
              humidityMinRef.current !== null &&
                nextHumidity < humidityMinRef.current,
              humidityMaxRef.current !== null &&
                nextHumidity > humidityMaxRef.current,
              co2MinRef.current !== null && nextCo2 < co2MinRef.current,
              co2MaxRef.current !== null && nextCo2 > co2MaxRef.current,
              tvocMinRef.current !== null && nextTvoc < tvocMinRef.current,
              tvocMaxRef.current !== null && nextTvoc > tvocMaxRef.current,
            ].map((condition, index) => {
              setAlerts((prevAlerts) =>
                prevAlerts.map((alert, i) =>
                  i === index ? { ...alert, activated: condition } : alert
                )
              );

              return condition;
            });

            indexRef.current += 1;
          } else {
            clearInterval(interval);
          }
        }, delayMs);

        return () => clearInterval(interval);
      });
  }, []);

  useEffect(() => {
    if (alerts.filter((value) => value.activated).length === 0) {
      handleCloseAlarm();
    }
  }, [alerts]);

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

  const handleClickAlarm = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (alerts.filter((value) => value.activated).length === 0) {
      handleCloseAlarm();
      return;
    }
    setAnchorElAlarm(event.currentTarget);
  };
  const handleCloseAlarm = () => {
    setAnchorElAlarm(null);
  };

  const handleConfirmAlarmSetting = () => {
    tempMinRef.current = tempMin;
    tempMaxRef.current = tempMax;
    humidityMinRef.current = humidityMin;
    humidityMaxRef.current = humidityMax;
    co2MinRef.current = co2Min;
    co2MaxRef.current = co2Max;
    tvocMinRef.current = tvocMin;
    tvocMaxRef.current = tvocMax;

    handleClose();
  };

  const handleCancelAlarmSetting = () => {
    handleClose();
  };

  return (
    <main className="flex flex-col gap-y-2 p-4">
      <div className="flex flex-row gap-2 w-full h-20 bg-white border-b-2 border-gray-300 items-center sticky top-0 py-2 z-100">
        <div className="flex flex-row w-full sm:w-24 sm:w-50 h-full ">
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            variant="contained"
            className="flex w-full h-full gap-x-2"
            onClick={handleClick}
          >
            <Settings size={50} />
            <span className="hidden sm:block"> Alarm Setting</span>
          </Button>
          <Popover
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <div className="w-full grid grid-cols-1 gap-y-2 p-4">
              <div>
                <div className="flex flex-row items-center">
                  <span className="w-60">Temperature safe range (°C): </span>
                  <div className="flex flex-row gap-x-2 w-50 items-center">
                    <InputNumber
                      id="tempMin"
                      name="tempMin"
                      className="h-full w-full"
                      placeholder="Not set"
                      step={0.01}
                      value={tempMin}
                      onChange={(value) => {
                        setTempMin(value);
                      }}
                    />
                    <span>-</span>
                    <InputNumber
                      id="tempMax"
                      name="tempMax"
                      placeholder="Not set"
                      step={0.01}
                      value={tempMax}
                      onChange={(value) => {
                        setTempMax(value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center">
                  <span className="w-60"> Humidity safe range (%): </span>
                  <div className="flex flex-row gap-x-2 w-50 items-center">
                    <InputNumber
                      id="humidityMin"
                      name="humidityMin"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={100}
                      value={humidityMin}
                      onChange={(value) => {
                        setHumidityMin(value);
                      }}
                    />{" "}
                    <span>-</span>{" "}
                    <InputNumber
                      id="humidityMax"
                      name="humidityMax"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={100}
                      value={humidityMax}
                      onChange={(value) => {
                        setHumidityMax(value);
                      }}
                    />{" "}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center">
                  <span className="w-60"> CO2 safe range (ppm): </span>
                  <div className="flex flex-row gap-x-2 w-50 items-center">
                    <InputNumber
                      id="co2Min"
                      name="co2Min"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      value={co2Min}
                      onChange={(value) => {
                        setCo2Min(value);
                      }}
                    />{" "}
                    <span>-</span>{" "}
                    <InputNumber
                      id="co2Max"
                      name="co2Max"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      value={co2Max}
                      onChange={(value) => {
                        setCo2Max(value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center">
                  <span className="w-60"> TVOC safe range (ppb):</span>
                  <div className="flex flex-row gap-x-2 w-50 items-center">
                    <InputNumber
                      id="tvocMin"
                      name="tvocMin"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      value={tvocMin}
                      onChange={(value) => {
                        setTvocMin(value);
                      }}
                    />{" "}
                    <span>-</span>{" "}
                    <InputNumber
                      id="tvocMax"
                      name="tvocMax"
                      placeholder="Not set"
                      step={0.01}
                      min={0}
                      max={1000}
                      value={tvocMax}
                      onChange={(value) => {
                        setTvocMax(value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 w-full justify-end gap-x-2">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancelAlarmSetting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleConfirmAlarmSetting}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Popover>
        </div>
        <div className="sm:flex flex-row w-full h-full rounded-8 border-2 border-gray-300 shadow-md overflow-x-hidden hidden">
          <FlashBox
            items={alerts.filter((value) => value.activated)}
            className="h-full px-2 border-r-2 border-gray-300"
          >
            <Badge
              color="warning"
              badgeContent={alerts.filter((value) => value.activated).length}
              max={10}
              overlap="circular"
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <TriangleAlert
                size={58}
                className={
                  alerts.filter((value) => value.activated).length === 0
                    ? "text-gray-500"
                    : ""
                }
              />
            </Badge>
          </FlashBox>

          <TransitionGroup className="flex flex-row overflow-x-hidden gap-x-2 h-full">
            {alerts.map((alert, index) => (
              <AlarmCard
                key={index}
                visible={alert.activated}
                message={alert.message}
              />
            ))}
          </TransitionGroup>
        </div>

        <div className="w-full h-full block sm:hidden">
          <Button
            id="alarm-button"
            aria-controls={openAlarm ? "alarm-popover" : undefined}
            aria-haspopup="true"
            aria-expanded={openAlarm ? "true" : undefined}
            variant="outlined"
            color="warning"
            className="flex w-full h-full gap-x-2 !p-0"
            disabled={alerts.filter((value) => value.activated).length === 0}
            onClick={handleClickAlarm}
          >
            <FlashBox
              items={alerts.filter((value) => value.activated)}
              className="h-full w-full px-4"
            >
              <Badge
                color="warning"
                badgeContent={alerts.filter((value) => value.activated).length}
                max={10}
                overlap="circular"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <TriangleAlert
                  size={58}
                  className={
                    alerts.filter((value) => value.activated).length === 0
                      ? "text-gray-500"
                      : ""
                  }
                />
              </Badge>
            </FlashBox>
          </Button>
          <Popover
            id="alarm-popover"
            anchorEl={anchorElAlarm}
            open={openAlarm}
            onClose={handleCloseAlarm}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            className="block sm:hidden w-full"
          >
            <TransitionGroup className="flex flex-col  overflow-x-hidden gap-x-2 w-65 h-full">
              {alerts.map((alert, index) => (
                <AlarmItem
                  key={index}
                  visible={alert.activated}
                  message={alert.message}
                />
              ))}
            </TransitionGroup>
          </Popover>
        </div>
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
                    <stop offset="0%" stopColor="#2196f3" /> {/* Blue (cold) */}
                    <stop offset="50%" stopColor="#f44336" /> {/* Red (hot) */}
                    <stop offset="100%" stopColor="#ffeb3b" /> {/* Yellow */}
                  </linearGradient>
                </defs>
              </svg>

              <div className="grid grid-cols-1 justify-items-center content-center relative">
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
                      fontSize: {
                        xs: 20,
                        sm: 24,
                      },
                      transform: {
                        xs: "translate(0px, -8px)",
                        sm: "translate(0px, -10px)",
                      },
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

              <div className="grid grid-cols-1 justify-items-center content-center relative">
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
                      fontSize: {
                        xs: 20,
                        sm: 24,
                      },
                      transform: {
                        xs: "translate(0px, -8px)",
                        sm: "translate(0px, -10px)",
                      },
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

          <div className="w-full h-full max-w-4xl  border-2 rounded-[20px] border-gray-300 shadow-md">
            <WeatherChart
              height={375}
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
                    <stop offset="0%" stopColor="#2196f3" /> {/* Blue (cold) */}
                    <stop offset="50%" stopColor="#f44336" /> {/* Red (hot) */}
                    <stop offset="100%" stopColor="#ffeb3b" /> {/* Yellow */}
                  </linearGradient>
                </defs>
              </svg>

              <div className="grid grid-cols-1 justify-items-center content-center relative">
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
                      fontSize: {
                        xs: 20,
                        sm: 24,
                      },
                      transform: {
                        xs: "translate(0px, -8px)",
                        sm: "translate(0px, -10px)",
                      },
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

              <div className="grid grid-cols-1 justify-items-center content-center relative">
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
                      fontSize: {
                        xs: 20,
                        sm: 24,
                      },
                      transform: {
                        xs: "translate(0px, -8px)",
                        sm: "translate(0px, -10px)",
                      },
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

          <div className="w-full h-full max-w-4xl border-2 rounded-[20px] border-gray-300 shadow-md">
            <WeatherChart
              height={375}
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
  );
};

export default Page;

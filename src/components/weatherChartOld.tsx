// components/WeatherChart.tsx
"use client";

import React from "react";
import { LineChart } from "@mui/x-charts";
import { SensorData } from "@/type/sensor";

interface WeatherChartOldProps {
  sensorId: number;
  data: SensorData[];
  className?: string;
}

const WeatherChartOld: React.FC<WeatherChartOldProps> = ({
  sensorId,
  data,
  className,
}) => {
  const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

  // Construct series for all sensors
  const series = data.flatMap((sensor, index) => {
    const isSelected = index === sensorId;

    return [
      {
        id: `temp-${index}`,
        label: isSelected ? `Sensor ${index + 1} Temp (°C)` : undefined,
        data: sensor.temperature,
        color: isSelected ? "#ff5722" : "#ffccbc",
      },
      {
        id: `hum-${index}`,
        label: isSelected ? `Sensor ${index + 1} Humidity (%)` : undefined,
        data: sensor.humidity,
        color: isSelected ? "#2196f3" : "#bbdefb",
      },
    ];
  });

  return (
    <div className={className}>
      <LineChart
        className="h-[100%]"
        series={series}
        xAxis={[
          {
            scaleType: "point",
            data: times,
            label: "Time",
            valueFormatter: (value) => value.toString(),
          },
        ]}
        grid={{ horizontal: true, vertical: true }}
      />
    </div>
  );
};

export default WeatherChartOld;

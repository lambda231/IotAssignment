"use client";

import { LineChart } from "@mui/x-charts/LineChart";

const WeatherChart = () => {
  // Mock time-based data (e.g., hourly)
  const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

  // Corresponding temperature and humidity readings
  const temperature = [15, 17, 18, 20, 22, 23]; // Celsius
  const humidity = [70, 68, 65, 63, 60, 58]; // Percent

  return (
    <LineChart
      width={600}
      height={400}
      xAxis={[
        {
          scaleType: "point",
          data: times,
          label: "Time",
          valueFormatter: (value) => value.toString(),
        },
      ]}
      series={[
        {
          id: "temp",
          data: temperature,
          label: "Temperature (°C)",
          color: "#ff5722",
        },
        { id: "hum", data: humidity, label: "Humidity (%)", color: "#2196f3" },
      ]}
      grid={{ horizontal: true }}
    />
  );
};

export default WeatherChart;

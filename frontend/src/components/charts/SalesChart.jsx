import React from "react";
import Chart from "react-apexcharts";

export default function SalesChart({ data }) {
  const options = {
    chart: { id: "sales-chart" },
    xaxis: { categories: data.map((d) => d.date) },
    colors: ["#4F46E5"],
  };

  const series = [
    {
      name: "Sales",
      data: data.map((d) => d.total),
    },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Sales Over Time</h2>
      <Chart options={options} series={series} type="line" height={300} />
    </div>
  );
}

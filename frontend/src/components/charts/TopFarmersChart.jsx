import React from "react";
import Chart from "react-apexcharts";

export default function TopFarmersChart({ data }) {
  const options = {
    chart: { id: "top-farmers" },
    xaxis: { categories: data.map((f) => f.name) },
    colors: ["#16A34A"],
  };

  const series = [
    {
      name: "Total Purchase",
      data: data.map((f) => f.total),
    },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Top 5 Farmers</h2>
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
}

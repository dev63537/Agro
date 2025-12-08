import React from "react";
import Chart from "react-apexcharts";

export default function LowStockChart({ data }) {
  const options = {
    labels: data.map((p) => p.name),
    colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6"],
  };

  const series = data.map((p) => p.qty);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Low Stock Alerts</h2>
      <Chart options={options} series={series} type="donut" height={300} />
    </div>
  );
}

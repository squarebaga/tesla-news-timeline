import React from "react";

const newsItems = [
  {
    date: "06/27/2025",
    tag: "#Autopilot",
    title: "Tesla Expands Full Self-Driving Beta Program",
    summary:
      "Tesla has announced an expansion of its Full Self-Driving (FSD) beta program, allowing more users to access the latest features."
  },
  {
    date: "06/25/2025",
    tag: "#BatteryTech",
    title: "New Tesla Battery Technology Improves Range",
    summary:
      "Tesla has unveiled a new battery technology aimed at significantly improving range of its electric vehicles."
  },
  {
    date: "06/23/2025",
    tag: "#Supercharger",
    title: "Tesla Opens New Supercharger Stations in Europe",
    summary:
      "Tesla has opened several new Supercharger stations across Europe to support growing EV demand."
  }
];

export default function TeslaNewsTimeline() {
  return (
    <div className="bg-red-700 min-h-screen p-6 text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">TeslaNews Timeline</h1>
        <div className="relative border-l-2 border-white pl-6">
          {newsItems.map((item, index) => (
            <div key={index} className="mb-12 relative">
              <div className="absolute left-[-12px] top-1 w-3 h-3 bg-white rounded-full"></div>
              <p className="text-sm text-white/70">{item.date} <span className="ml-2 text-xs font-medium bg-white/10 px-2 py-1 rounded">{item.tag}</span></p>
              <h2 className="text-xl font-semibold mt-2">{item.title}</h2>
              <p className="text-white/90 mt-1">{item.summary}</p>
              <a href="#" className="text-white underline mt-2 inline-block">Read More</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

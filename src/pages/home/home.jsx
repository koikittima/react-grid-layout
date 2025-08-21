import React, { useState , useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import GridLayout, { WidthProvider, Responsive } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const summaryData = [
  { title: "Total Job Tracking", value: 200, key: "jobSummary" },
  { title: "Total Incident Tracking", value: 200, key: "incidentSummary" },
  { title: "Total Service Status", value: 65, key: "serviceSummary" },
];

const jobData = [
  { name: "New", value: 100 },
  { name: "Inprogress", value: 50 },
  { name: "Pending", value: 40 },
  { name: "Completed", value: 10 },
];

const incidentData = [
  { name: "Opened", value: 100 },
  { name: "Inprogress", value: 50 },
  { name: "Pending", value: 40 },
  { name: "Closed", value: 10 },
];

const serviceData = [
  { name: "Up", value: 50 },
  { name: "Down", value: 5 },
  { name: "Suspend", value: 10 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57"];

export default function DashboardMock() {
  const [layouts, setLayouts] = useState({
    lg: [
      { i: "jobSummary", x: 0, y: 0, w: 4, h: 1 },
      { i: "incidentSummary", x: 4, y: 0, w: 4, h: 1 },
      { i: "serviceSummary", x: 8, y: 0, w: 4, h: 1 },
      { i: "job", x: 0, y: 1, w: 6, h: 4 },
      { i: "incident", x: 6, y: 1, w: 6, h: 4 },
      { i: "service", x: 0, y: 5, w: 12, h: 2 },
    ],
  });

  console.log('layouts', layouts);
  

  const [isEdit, setIsEdit] = useState(false);

  const handleSave = () => {
    localStorage.setItem("dashboardLayouts", JSON.stringify(layouts));
    setIsEdit(false);
  };

 useEffect(() => {
    const saved = localStorage.getItem("dashboardLayouts");
    if (saved) {
      setLayouts(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div>
          {isEdit ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded mr-2 shadow hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEdit(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Edit Layout
            </button>
          )}
        </div>
      </div>

      <ResponsiveGridLayout
        className={`layout ${isEdit ? "edit-mode" : ""}`}
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 2 }}
        rowHeight={100}
        width={1200}
        isDraggable={isEdit}
        isResizable={isEdit}
        onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
      >
        {summaryData.map((item) => (
          <div key={item.key} className="flex">
            <div className="bg-white shadow rounded p-4 w-full text-center">
              <div className="text-gray-400 text-sm">{item.title}</div>
              <div className="text-2xl font-bold">{item.value}</div>
            </div>
          </div>
        ))}

        <div key="job" className="bg-white shadow rounded p-4">
          <h3 className="font-bold mb-2">Job Tracking</h3>
          <PieChart width={250} height={200}>
            <Pie
              data={jobData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              label
            >
              {jobData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div key="incident" className="bg-white shadow rounded p-4">
          <h3 className="font-bold mb-2">Incident Tracking</h3>
          <PieChart width={250} height={200}>
            <Pie
              data={incidentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              label
            >
              {incidentData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div key="service" className="bg-white shadow rounded p-4">
          <h3 className="font-bold mb-2">Service History</h3>
          <BarChart width={500} height={200} data={serviceData}>
            <XAxis dataKey="name" />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="value">
              {serviceData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </div>
      </ResponsiveGridLayout>

      <style>
        {`
          .edit-mode .react-grid-item {
            background: rgba(200,200,200,0.2);
          }
        `}
      </style>
    </div>
  );
}


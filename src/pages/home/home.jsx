import React, { useState, useEffect, useMemo } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import DonutChart from "../../components/chart/donutChart";
import GraphStack from "../../components/chart/graphStack";
import {
  dataIncidentTracking,
  dataJobTacking,
  groupedDataStack,
  summaryData,
} from "../../static/mockData";

const ResponsiveGridLayout = WidthProvider(Responsive);

//ค่าคงที่ Grid
const ROW_HEIGHT = 90;
const MARGIN = [10, 10]; // [x, y]
const PADDING = [10, 10]; // [x, y]
const COLS = { lg: 12, md: 10, sm: 6, xs: 2 }; //จำนวนคอลัมน์ของแต่ละ breakpoint

//Helper: scale & mirror 
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

//แปลง layout จากจำนวนคอลัมน์เดิม -> เป้าหมาย โดยรักษาสัดส่วน x,w 
function scaleLayout(layout, fromCols, toCols) {
  const ratio = toCols / fromCols;
  return (layout || []).map(({ i, x, y, w, h, ...rest }) => {
    const nx = Math.floor(x * ratio);
    const nw = Math.max(1, Math.ceil(w * ratio));
    const cx = clamp(nx, 0, toCols - nw);
    return { i, x: cx, y, w: nw, h, ...rest };
  });
}

//แปลง layout ปัจจุบัน (ของ breakpoint ที่แก้) normalize เป็นฐาน lg  กระจายสเกลไปทุก breakpoint 
function mirrorFrom(currentLayout, fromBp) {
  const baseLg = scaleLayout(currentLayout, COLS[fromBp], COLS.lg);
  return {
    lg: scaleLayout(baseLg, COLS.lg, COLS.lg),
    md: scaleLayout(baseLg, COLS.lg, COLS.md),
    sm: scaleLayout(baseLg, COLS.lg, COLS.sm),
    xs: scaleLayout(baseLg, COLS.lg, COLS.xs),
  };
}

//สร้าง layouts ครบทุก breakpoint จากฐาน lg 
function makeAllLayoutsFromBase(baseLg) {
  return mirrorFrom(baseLg, "lg");
}

function DashboardMock() {
  const [isEdit, setIsEdit] = useState(false);

  //เก็บ breakpoint/cols/width และสถานะกำลังลาก
  const [currentBp, setCurrentBp] = useState("lg");
  const [cols, setCols] = useState(COLS.lg);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [isDragging, setIsDragging] = useState(false);
  

  //Layout เริ่มต้น (ฐาน lg)
  const initialBaseLg = [
    { i: "jobSummary", x: 0, y: 0, w: 4, h: 1 },
    { i: "incidentSummary", x: 4, y: 0, w: 4, h: 1 },
    { i: "serviceSummary", x: 8, y: 0, w: 4, h: 1 },
    { i: "job", x: 0, y: 1, w: 6, h: 4 },
    { i: "incident", x: 6, y: 1, w: 6, h: 4 },
    { i: "service", x: 0, y: 5, w: 12, h: 2 },
  ];

  //สร้าง state layouts ให้ครบทุก breakpoint ตั้งแต่ต้น 
  const [layouts, setLayouts] = useState(() => makeAllLayoutsFromBase(initialBaseLg));

  //โหลดจาก localStorage ถ้ามี แล้ว normalize ให้ครบทุก bp 
  useEffect(() => {
    const saved = localStorage.getItem("dashboardLayouts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.lg && (!parsed.md || !parsed.sm || !parsed.xs)) {
          setLayouts(makeAllLayoutsFromBase(parsed.lg));
        } else if (parsed?.lg && parsed?.md && parsed?.sm && parsed?.xs) {
          setLayouts(parsed);
        }
      } catch {
       //
      }
    }
  }, []);

  //คำนวณความกว้างคอลัมน์สำหรับวาด overlay
  const colWidth = useMemo(() => {
    return (containerWidth - PADDING[0] * 2 - MARGIN[0] * (cols - 1)) / cols;
  }, [containerWidth, cols]);

  //ประมาณจำนวนแถวจาก layout ปัจจุบัน (ของ breakpoint ปัจจุบัน)
  const rows = useMemo(() => {
    const list = layouts[currentBp] || layouts.lg || [];
    const maxY = list.reduce((m, it) => Math.max(m, it.y + it.h), 0);
    return Math.max(maxY, 1);
  }, [layouts, currentBp]);

  //วาด overlay ช่องเทา (ทุกตำแหน่งบน grid) ตอนกำลังลาก
  const DropHints = useMemo(() => {
    if (!isEdit || !isDragging) return null;

    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        cells.push(
          <div
            key={`hint-${x}-${y}`}
            className="drop-hint-cell"
            style={{
              position: "absolute",
              left: PADDING[0] + x * (colWidth + MARGIN[0]),
              top: PADDING[1] + y * (ROW_HEIGHT + MARGIN[1]),
              width: colWidth,
              height: ROW_HEIGHT,
              borderRadius: 12,
              background: "rgba(107,114,128,0.08)",
              border: "1px dashed #D1D5DB",
            }}
          />
        );
      }
    }
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {cells}
      </div>
    );
  }, [isEdit, isDragging, rows, cols, colWidth]);

  const handleSave = () => {
    setIsEdit(false);
    //layouts ถูกบันทึกทุกครั้งใน onLayoutChange อยู่แล้ว
  };

  const resetData = () =>{
    setLayouts({
      lg: [
        { i: "jobSummary", x: 0, y: 0, w: 4, h: 1 },
        { i: "incidentSummary", x: 4, y: 0, w: 4, h: 1 },
        { i: "serviceSummary", x: 8, y: 0, w: 4, h: 1 },
        { i: "job", x: 0, y: 1, w: 6, h: 3 },
        { i: "incident", x: 6, y: 1, w: 6, h: 3 },
        { i: "service", x: 0, y: 5, w: 12, h: 3 },
      ],
     })
  }

  console.log(layouts)

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: "#FAF9F6" }}>
      <div className="flex justify-between mb-4 p-[8px]">
        <div className="text-start">
          <div className="text-[24px]">Dashboard</div>
          <div className="text-[12px] text-[#B7AFAC]">MySYMC - Self Service Portal</div>
        </div>
        <div>
          {isEdit ? (
            <>
              <button
                onClick={handleSave}
                className="bg-[#FFD699] rounded mr-[8px] shadow border px-3 py-1"
              >
                Save Layout
              </button>
              <button
                onClick={() => setIsEdit(false)}
                className="rounded shadow border px-3 py-1"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
            <button
              onClick={() => 
                   resetData()
              }
              className="bg-[#FFD699] text-white mx-[8px] rounded shadow"
            >
              Reset to default
            </button>
            <button
              onClick={() => setIsEdit(true)}
              className="bg-[#FFD699] text-white px-4 py-2 rounded shadow"
            >
              Change Layout
            </button>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <ResponsiveGridLayout
          className={`layout ${isEdit ? "edit-mode" : ""} ${isDragging ? "dragging" : ""}`}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          width={containerWidth}
          margin={MARGIN}
          containerPadding={PADDING}
          isDraggable={isEdit}
          isResizable={isEdit}
          // compactType="vertical"
          preventCollision={false}
          //แก้ layout ที่ bp ไหน  normalize เป็น lg  mirror ไปทุก bp  save
          onLayoutChange={(currentLayout /*, allLayouts */) => {
            if (!isEdit) return;
            const synced = mirrorFrom(currentLayout, currentBp);
            setLayouts(synced);
            localStorage.setItem("dashboardLayouts", JSON.stringify(synced));
          }}
          onDragStart={() => setIsDragging(true)}
          onDrag={() => setIsDragging(true)}
          onDragStop={() => setIsDragging(false)}
          onBreakpointChange={(bp, newCols) => {
            setCurrentBp(bp);
            setCols(newCols);
          }}
          onWidthChange={(w, _m, newCols) => {
            setContainerWidth(w);
            setCols(newCols);
          }}
        >
          {/* summary tiles */}
          {summaryData.map((item) => (
            <div key={item.key} className="flex bg-[#FFFFFF]" style={{ borderRadius: "16px" }}>
              <div
                className="border border-[#E0E0E0] w-full p-[12px]"
                style={{ borderRadius: "16px" }}
              >
                <div className="flex justify-between">
                  <div className="w-[2rem] bg-gradient-to-r from-[#FB8C00] to-[#FF4081] rounded-full px-[4px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                  </div>
                  <div className="text-[24px] font-bold">{item.value}</div>
                </div>
                <div className="text-start text-[16px]">{item.title}</div>
              </div>
            </div>
          ))}

          {/* Job */}
          <div
            key="job"
            className="border border-[#E0E0E0] bg-[#FFFFFF]"
            style={{ borderRadius: "16px" }}
          >
            <div className="p-[12px]">
              <div className="flex justify-between items-center flex-nowrap">
                <div className="flex items-center">
                  <div className="w-[2rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                  </div>
                  <div className="px-[4px]">Job Tracking</div>
                </div>
                <div className="rounded-full px-[16px] py-[2px] border border-[#E0E0E0] cursor-pointer">
                  View all
                </div>
              </div>
              <DonutChart label="Job Tracking" data={dataJobTacking} />
            </div>
          </div>

          {/* Incident */}
          <div
            key="incident"
            className="border border-[#E0E0E0] bg-[#FFFFFF]"
            style={{ borderRadius: "16px" }}
          >
            <div className="p-[12px]">
              <div className="flex justify-between items-center flex-nowrap">
                <div className="flex items-center">
                  <div className="w-[2rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                  </div>
                  <div className="px-[4px]">Incident Tracking</div>
                </div>
                <div className="rounded-full px-[16px] py-[2px] border border-[#E0E0E0] cursor-pointer">
                  View all
                </div>
              </div>
              <DonutChart data={dataIncidentTracking} />
            </div>
          </div>

          {/* Service */}
          <div
            key="service"
            className="border border-[#E0E0E0] bg-[#FFFFFF]"
            style={{ borderRadius: "16px" }}
          >
            <div className="p-[12px]">
              <div className="flex justify-between items-center flex-nowrap">
                <div className="flex items-center">
                  <div className="w-[2rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z"
                      />
                    </svg>
                  </div>
                  <div className="px-[4px]">Service History</div>
                </div>
                <div className="rounded-full px-[16px] py-[2px] border border-[#E0E0E0] cursor-pointer">
                  View all
                </div>
              </div>
              <GraphStack data={groupedDataStack} />
            </div>
          </div>
        </ResponsiveGridLayout>

        {/* overlay ช่องเทา ตอนกำลังลาก */}
        {DropHints}
      </div>

      <style>{`
        .edit-mode .react-grid-item {
          background: rgba(200,200,200,0.05);
          cursor: move;
        }
        .edit-mode .react-grid-placeholder {
          background: rgba(17,24,39,0.15);
          border: 2px dashed #9CA3AF;
          border-radius: 12px;
          transition: transform 100ms ease, width 100ms ease, height 100ms ease;
        }
        .dragging .react-grid-item { z-index: 2; }
        .drop-hint-cell { transition: opacity 100ms ease; }
      `}</style>
    </div>
  );
}

export default DashboardMock;







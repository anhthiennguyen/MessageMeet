import { useRef, useState } from "react";
import { DAYS, generateSlots, formatTime } from "../lib/availability";

const SLOTS = generateSlots(8, 22);

export default function WeekGrid({ busySlots, onChange }) {
  const dragging = useRef(false);
  const dragMode = useRef(null); // "add" or "remove"
  const [hoveredCell, setHoveredCell] = useState(null);

  function toggleSlot(day, slot) {
    const next = { ...busySlots, [day]: new Set(busySlots[day] ?? []) };
    if (dragMode.current === "remove" || next[day].has(slot)) {
      next[day].delete(slot);
    } else {
      next[day].add(slot);
    }
    onChange(next);
  }

  function onMouseDown(day, slot, e) {
    e.preventDefault();
    dragging.current = true;
    const isBusy = (busySlots[day] ?? new Set()).has(slot);
    dragMode.current = isBusy ? "remove" : "add";
    toggleSlot(day, slot);
  }

  function onMouseEnter(day, slot) {
    setHoveredCell(`${day}-${slot}`);
    if (dragging.current) toggleSlot(day, slot);
  }

  function onMouseUp() {
    dragging.current = false;
    dragMode.current = null;
  }

  return (
    <div
      className="overflow-x-auto select-none"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <table className="border-collapse text-xs min-w-full">
        <thead>
          <tr>
            <th className="w-16 sticky left-0 bg-white z-10" />
            {DAYS.map((d) => (
              <th key={d} className="px-2 py-1 font-semibold text-zinc-600 text-center min-w-[80px]">
                {d.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map((slot, i) => (
            <tr key={slot}>
              <td className="sticky left-0 bg-white pr-2 text-right text-zinc-400 text-xs w-16 leading-none py-0">
                {slot.endsWith(":00") ? formatTime(slot) : ""}
              </td>
              {DAYS.map((day) => {
                const isBusy = (busySlots[day] ?? new Set()).has(slot);
                const isHour = slot.endsWith(":00");
                const isHalf = slot.endsWith(":30");
                return (
                  <td
                    key={day}
                    onMouseDown={(e) => onMouseDown(day, slot, e)}
                    onMouseEnter={() => onMouseEnter(day, slot)}
                    className={[
                      "border-l border-zinc-200 cursor-pointer transition-colors h-3",
                      isHour ? "border-b border-zinc-200" : isHalf ? "border-b border-dashed border-zinc-200" : "border-b border-zinc-100",
                      isBusy
                        ? "bg-red-200 hover:bg-red-300"
                        : "bg-emerald-50 hover:bg-emerald-100",
                    ].join(" ")}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

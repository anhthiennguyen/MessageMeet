export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Generate time slots from startHour to endHour in 30-min increments
export function generateSlots(startHour = 8, endHour = 22) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${h}:00`);
    slots.push(`${h}:30`);
  }
  return slots;
}

export function formatTime(slot) {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

// Given busySlots = { Monday: Set<slot>, ... }, return freeRanges per day
export function getFreeRanges(busySlots, allSlots) {
  const result = {};
  for (const day of DAYS) {
    const busy = busySlots[day] ?? new Set();
    const freeSlots = allSlots.filter((s) => !busy.has(s));
    result[day] = mergeConsecutiveSlots(freeSlots, allSlots);
  }
  return result;
}

function mergeConsecutiveSlots(slots, allSlots) {
  if (slots.length === 0) return [];
  const ranges = [];
  let start = slots[0];
  let prev = slots[0];

  for (let i = 1; i < slots.length; i++) {
    const cur = slots[i];
    const prevIdx = allSlots.indexOf(prev);
    const curIdx = allSlots.indexOf(cur);
    if (curIdx === prevIdx + 1) {
      prev = cur;
    } else {
      ranges.push({ start, end: nextSlot(prev, allSlots) });
      start = cur;
      prev = cur;
    }
  }
  ranges.push({ start, end: nextSlot(prev, allSlots) });
  return ranges;
}

function nextSlot(slot, allSlots) {
  const idx = allSlots.indexOf(slot);
  if (idx === -1 || idx === allSlots.length - 1) {
    // Add 30 min manually
    const [h, m] = slot.split(":").map(Number);
    const totalMin = h * 60 + m + 30;
    return `${Math.floor(totalMin / 60)}:${String(totalMin % 60).padStart(2, "0")}`;
  }
  return allSlots[idx + 1];
}

// Generate the availability message
export function generateMessage(freeRanges) {
  // Build a string key per day's ranges for grouping
  const dayRangeKey = (ranges) =>
    ranges.map((r) => `${r.start}-${r.end}`).join(",");

  // Group days by identical range pattern
  const groups = {};
  for (const day of DAYS) {
    const ranges = freeRanges[day];
    if (!ranges || ranges.length === 0) continue;
    const key = dayRangeKey(ranges);
    if (!groups[key]) groups[key] = { days: [], ranges };
    groups[key].days.push(day);
  }

  if (Object.keys(groups).length === 0) return "No availability to show.";

  const lines = Object.values(groups).map(({ days, ranges }) => {
    const dayStr = days.map((d) => d.slice(0, 3)).join("/");
    const timeStr = ranges
      .map((r) => `${formatTime(r.start)}–${formatTime(r.end)}`)
      .join(", ");
    return `${dayStr}: ${timeStr}`;
  });

  return "I am available:\n" + lines.join("\n");
}

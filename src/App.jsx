import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { DAYS, generateSlots, getFreeRanges, generateMessage } from "./lib/availability";
import WeekGrid from "./components/WeekGrid";
import MessageOutput from "./components/MessageOutput";

const SLOTS = generateSlots(8, 22);
const DOC_ID = "my-availability";

function setsToObj(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, [...v]]));
}
function objToSets(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, new Set(v)]));
}

const emptyBusy = () => Object.fromEntries(DAYS.map((d) => [d, new Set()]));

export default function App() {
  const [busySlots, setBusySlots] = useState(emptyBusy());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "availability", DOC_ID)).then((snap) => {
      if (snap.exists()) setBusySlots(objToSets(snap.data()));
    });
  }, []);

  async function save() {
    setSaving(true);
    await setDoc(doc(db, "availability", DOC_ID), setsToObj(busySlots));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearAll() {
    setBusySlots(emptyBusy());
  }

  const freeRanges = getFreeRanges(busySlots, SLOTS);
  const message = generateMessage(freeRanges, SLOTS);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MessageMeet</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Click or drag to mark when you're busy. Free time is green.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded border border-zinc-300 text-sm hover:bg-zinc-100 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-1.5 rounded bg-zinc-900 text-white text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-300 inline-block" />
            Busy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200 inline-block" />
            Free
          </span>
        </div>

        {/* Grid */}
        <WeekGrid busySlots={busySlots} onChange={setBusySlots} />

        {/* Message */}
        <MessageOutput message={message} />
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

const PROJECT_ID = "portfolio-ec9ef";
const DOC_PATH = "availability/my-availability";

// Bookmarklet source — fetches availability from Firestore REST API and fills when2meet
const bookmarkletCode = `(async function(){
  const url='https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${DOC_PATH}';
  let busy={};
  try{
    const r=await fetch(url);
    const d=await r.json();
    if(d.fields){
      for(const[day,val]of Object.entries(d.fields)){
        busy[day]=new Set((val.arrayValue?.values||[]).map(v=>v.stringValue));
      }
    }
  }catch(e){alert('Failed to load availability: '+e.message);return;}
  const slots=[];
  for(let h=8;h<22;h++)for(const m of[0,15,30,45])slots.push(h+':'+(m===0?'00':m));
  const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const free={};
  for(const day of['Monday','Tuesday','Wednesday','Thursday','Friday']){
    const b=busy[day]||new Set();
    free[day]=new Set(slots.filter(s=>!b.has(s)));
  }
  if(typeof TimeOfSlot==='undefined'||!TimeOfSlot.length){
    alert('Could not detect when2meet grid. Make sure you are on a when2meet page and logged in.');
    return;
  }
  let filled=0;
  for(const ts of TimeOfSlot){
    const date=new Date(ts*1000);
    const day=DAYS[date.getDay()];
    const h=date.getHours();
    const m=date.getMinutes();
    const key=h+':'+(m===0?'00':m===15?'15':m===30?'30':'45');
    if(free[day]&&free[day].has(key)){
      const cell=document.getElementById('YouTime'+ts);
      if(cell){
        cell.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        cell.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
        filled++;
      }
    }
  }
  alert('Done! Filled '+filled+' slots from your MessageMeet availability.');
})();`;

const bookmarkletHref = "javascript:" + encodeURIComponent(bookmarkletCode);

export default function BookmarkletInstall() {
  const linkRef = useRef(null);

  useEffect(() => {
    // Set href directly to bypass React's javascript: URL sanitization
    if (linkRef.current) {
      linkRef.current.setAttribute("href", bookmarkletHref);
    }
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-zinc-700">Auto-fill When2Meet</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Drag the button below to your bookmarks bar. Then open any when2meet link, log in, and click the bookmark — it will fill your free slots automatically.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          ref={linkRef}
          href="#"
          onClick={(e) => e.preventDefault()}
          draggable
          className="px-4 py-2 rounded bg-zinc-900 text-white text-sm hover:bg-zinc-700 transition-colors cursor-grab active:cursor-grabbing select-none"
          title="Drag me to your bookmarks bar"
        >
          📅 Fill When2Meet
        </a>
        <span className="text-xs text-zinc-400">← drag to bookmarks bar</span>
      </div>

      <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
        <li>Drag the button above to your browser bookmarks bar</li>
        <li>Open a when2meet link and log in</li>
        <li>Click <strong className="text-zinc-700">Fill When2Meet</strong> in your bookmarks</li>
        <li>Your free time will be auto-selected</li>
      </ol>
    </div>
  );
}

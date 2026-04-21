import { useState } from "react";

export default function MessageOutput({ message }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">Generated Message</h2>
        <button
          onClick={copy}
          className="px-3 py-1 rounded text-xs bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-sm text-zinc-800 whitespace-pre-wrap font-sans leading-relaxed">
        {message}
      </pre>
    </div>
  );
}

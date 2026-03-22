/**
 * HashDisplay — shows a bytes32 / hex digest with copy-to-clipboard.
 */

import { useState, useCallback } from "react";

interface HashDisplayProps {
  label?: string;
  hex: string;
}

export function HashDisplay({ label, hex }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [hex]);

  return (
    <div className="mt-3">
      {label && <span className="label">{label}</span>}
      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5">
        <span className="hash-mono flex-1 truncate">{hex}</span>
        <button
          onClick={copy}
          className="shrink-0 text-xs text-gray-500 hover:text-gray-100 transition-colors"
          title="Copy"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

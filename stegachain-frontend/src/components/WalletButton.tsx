import { useRef, useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";

export function WalletButton() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  if (!isConnected) {
    return (
      <button onClick={connect} className="btn-primary">
        Connect
      </button>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm"
      >
        <span className="w-2 h-2 rounded-full bg-white shrink-0" />
        {short}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl p-3 space-y-2 z-50">
          <p className="text-xs text-neutral-500 font-mono break-all">{address}</p>
          <hr className="border-neutral-800" />
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="btn-ghost w-full justify-start text-xs"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { StepCard } from "@/components/StepCard";
import { FileDropzone } from "@/components/FileDropzone";
import { HashDisplay } from "@/components/HashDisplay";
import { Spinner } from "@/components/Spinner";
import { useStego } from "@/hooks/useStego";
import { useCrypto } from "@/hooks/useCrypto";
import { useHash } from "@/hooks/useHash";
import { useVerify } from "@/hooks/useVerify";
import { useWallet } from "@/hooks/useWallet";
import type { VerifyStatus } from "@/hooks/useVerify";

export function ReceiverFlow() {
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");

  const [ciphertext, setCiphertext] = useState<Uint8Array | null>(null);
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<`0x${string}` | null>(null);

  const [showCiphertext, setShowCiphertext] = useState(false);

  const { extract, isExtracting } = useStego();
  const { decrypt, isDecrypting } = useCrypto();
  const { hashFile, isHashing } = useHash();
  const {
    verify,
    status: verifyStatus,
    result: verifyResult,
    reset: resetVerify,
  } = useVerify();
  const { isConnected, isCorrectNetwork } = useWallet();

  async function handleExtract() {
    if (!stegoFile) return;

    const hashResult = await hashFile(stegoFile);
    if (hashResult) setImageHash(hashResult.hex);

    const payload = await extract(stegoFile);
    if (payload) setCiphertext(payload);
  }

  async function handleDecrypt() {
    if (!ciphertext || !passphrase.trim()) return;
    const result = await decrypt(ciphertext, passphrase);
    if (result !== null) setPlaintext(result);
  }

  async function handleVerify() {
    if (!imageHash) return;
    resetVerify();
    await verify(imageHash);
  }

  const verifyStatusUI: Record<VerifyStatus, { label: string; colour: string }> = {
    idle: { label: "", colour: "" },
    checking: { label: "Querying blockchain…", colour: "text-gray-400" },
    verified: { label: "VERIFIED ✓", colour: "text-white" },
    not_found: { label: "TAMPERED / NOT FOUND ✗", colour: "text-neutral-400" },
  };

  const { label: verifyLabel, colour: verifyColour } = verifyStatusUI[verifyStatus];

  return (
    <div className="space-y-4">
      <StepCard
        step={1}
        title="Upload stego-image & extract"
        description="Upload the stego-image received from the sender. The hidden ciphertext will be extracted from the pixel data."
      >
        <div className="space-y-3">
          <FileDropzone
            label="Drop stego-image here"
            hint="PNG only"
            onFile={(f) => {
              setStegoFile(f);
              setCiphertext(null);
              setPlaintext(null);
              setImageHash(null);
              setShowCiphertext(false);
              resetVerify();
            }}
            file={stegoFile}
          />
          <button
            className="btn-primary"
            onClick={handleExtract}
            disabled={!stegoFile || isExtracting || isHashing}
          >
            {(isExtracting || isHashing) && <Spinner size="sm" />}
            Extract & Hash
          </button>
          {ciphertext && (
            <div className="space-y-2">
              <button
                className="btn-ghost text-xs px-0 gap-1"
                onClick={() => setShowCiphertext((v) => !v)}
              >
                <span>{showCiphertext ? "▲" : "▼"}</span>
                {showCiphertext ? "Hide" : "View"} ciphertext
                <span className="text-neutral-600">({ciphertext.length} bytes)</span>
              </button>
              {showCiphertext && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 space-y-1">
                  <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                    First 32 bytes (hex)
                  </p>
                  <p className="font-mono text-xs text-neutral-400 break-all leading-relaxed">
                    {Array.from(ciphertext.slice(0, 32))
                      .map((b) => b.toString(16).padStart(2, "0"))
                      .join(" ")}
                    &hellip;
                  </p>
                </div>
              )}
            </div>
          )}
          {imageHash && (
            <HashDisplay label="Image SHA-256 (used for verification)" hex={imageHash} />
          )}
        </div>
      </StepCard>

      <StepCard
        step={2}
        title="Decrypt payload"
        description="Enter the passphrase that was shared with you by the sender."
        disabled={!ciphertext}
      >
        <div className="space-y-3">
          <div>
            <label className="label" htmlFor="rx-pass">
              Passphrase
            </label>
            <input
              id="rx-pass"
              type="password"
              className="input"
              placeholder="Passphrase from sender…"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleDecrypt}
            disabled={!passphrase.trim() || isDecrypting}
          >
            {isDecrypting && <Spinner size="sm" />}
            Decrypt
          </button>

          {plaintext !== null && (
            <div className="mt-2">
              <span className="label">Recovered plaintext</span>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white whitespace-pre-wrap break-words">
                {plaintext}
              </div>
            </div>
          )}
        </div>
      </StepCard>

      <StepCard
        step={3}
        title="Verify integrity on-chain"
        description="Query the StegaChain contract with the image hash. A match confirms the image has not been tampered with since it was registered."
        disabled={!imageHash}
      >
        {!isConnected && (
          <p className="text-xs text-neutral-400 mb-3">Connect your wallet to verify.</p>
        )}
        {isConnected && !isCorrectNetwork && (
          <p className="text-xs text-neutral-400 mb-3">
            Switch to the correct network to continue.
          </p>
        )}

        <div className="space-y-3">
          <button
            className="btn-primary"
            onClick={handleVerify}
            disabled={
              !imageHash ||
              !isConnected ||
              !isCorrectNetwork ||
              verifyStatus === "checking"
            }
          >
            {verifyStatus === "checking" && <Spinner size="sm" />}
            Verify on-chain
          </button>

          {verifyStatus !== "idle" && (
            <div
              className={`mt-2 p-4 rounded-xl border text-sm font-semibold ${
                verifyStatus === "verified"
                  ? "bg-white/5 border-white/20 text-white"
                  : verifyStatus === "not_found"
                    ? "bg-neutral-900 border-neutral-700 text-neutral-400"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400"
              }`}
            >
              <span className={verifyColour}>{verifyLabel}</span>

              {verifyStatus === "verified" && verifyResult && (
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs font-normal">
                  <dt className="text-gray-500">Registered by</dt>
                  <dd className="font-mono text-gray-300 truncate">
                    {verifyResult.sender}
                  </dd>
                  <dt className="text-gray-500">Timestamp</dt>
                  <dd className="text-gray-300">
                    {verifyResult.timestamp?.toLocaleString()}
                  </dd>
                </dl>
              )}
            </div>
          )}
        </div>
      </StepCard>
    </div>
  );
}

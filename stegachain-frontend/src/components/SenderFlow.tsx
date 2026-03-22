import { useState } from "react";
import { StepCard } from "@/components/StepCard";
import { FileDropzone } from "@/components/FileDropzone";
import { HashDisplay } from "@/components/HashDisplay";
import { Spinner } from "@/components/Spinner";
import { useCrypto } from "@/hooks/useCrypto";
import { useStego } from "@/hooks/useStego";
import { useHash } from "@/hooks/useHash";
import { useLogHash } from "@/hooks/useLogHash";
import { useWallet } from "@/hooks/useWallet";

export function SenderFlow() {
  const [secret, setSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [ciphertext, setCiphertext] = useState<Uint8Array | null>(null);
  const [stegoBlob, setStegoBlob] = useState<Blob | null>(null);
  const [stegoPreviewUrl, setStegoPreviewUrl] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<`0x${string}` | null>(null);

  const [showCiphertext, setShowCiphertext] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { encrypt, isEncrypting } = useCrypto();
  const { embed, isEmbedding } = useStego();
  const { hashBytes, isHashing } = useHash();
  const { logHash, isSubmitting, isConfirmed, txHash } = useLogHash();
  const { isConnected, isCorrectNetwork } = useWallet();

  async function handleEncrypt() {
    if (!secret.trim() || !passphrase.trim()) return;
    const result = await encrypt(secret, passphrase);
    if (result) {
      setCiphertext(result.ciphertext);
      setShowCiphertext(false);
    }
  }

  async function handleEmbed() {
    if (!ciphertext || !coverImage) return;
    if (stegoPreviewUrl) URL.revokeObjectURL(stegoPreviewUrl);

    const result = await embed(coverImage, ciphertext);
    if (!result) return;

    setStegoBlob(result.blob);
    setStegoPreviewUrl(URL.createObjectURL(result.blob));

    const hashResult = await hashBytes(result.pngBytes);
    if (hashResult) setImageHash(hashResult.hex);
  }

  function handleDownload() {
    if (!stegoBlob) return;
    const url = URL.createObjectURL(stegoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stego-image.png";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleLogHash() {
    if (!imageHash) return;
    await logHash(imageHash);
  }

  const ciphertextHex = ciphertext
    ? Array.from(ciphertext.slice(0, 32))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")
    : null;

  return (
    <>
      <div className="space-y-4">
        <StepCard
          step={1}
          title="Encrypt secret message"
          description="Enter your secret and a passphrase. AES-256-GCM runs entirely in-browser via WebAssembly."
        >
          <div className="space-y-3">
            <div>
              <label className="label" htmlFor="secret">
                Secret message
              </label>
              <textarea
                id="secret"
                className="input h-24 resize-none"
                placeholder="Type your secret here…"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="passphrase">
                Passphrase (AES key)
              </label>
              <input
                id="passphrase"
                type="password"
                className="input"
                placeholder="Strong passphrase…"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>
            <button
              className="btn-primary w-full sm:w-auto"
              onClick={handleEncrypt}
              disabled={!secret.trim() || !passphrase.trim() || isEncrypting}
            >
              {isEncrypting && <Spinner size="sm" />}
              Encrypt
            </button>

            {ciphertext && ciphertextHex && (
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
                      {ciphertextHex}&hellip;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </StepCard>

        <StepCard
          step={2}
          title="Embed into cover image"
          description="Select a PNG image. The ciphertext is hidden in the least-significant bits of the pixels."
          disabled={!ciphertext}
        >
          <div className="space-y-3">
            <FileDropzone
              label="Drop cover image here"
              hint="PNG only · larger image = more capacity"
              onFile={setCoverImage}
              file={coverImage}
            />
            <button
              className="btn-primary w-full sm:w-auto"
              onClick={handleEmbed}
              disabled={!coverImage || isEmbedding || isHashing}
            >
              {(isEmbedding || isHashing) && <Spinner size="sm" />}
              Embed & Hash
            </button>

            {stegoBlob && stegoPreviewUrl && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="btn-secondary" onClick={() => setLightboxOpen(true)}>
                  🔍 Preview image
                </button>
                <button className="btn-secondary" onClick={handleDownload}>
                  ⬇ Download
                </button>
              </div>
            )}
            {imageHash && (
              <HashDisplay label="SHA-256 image hash (bytes32)" hex={imageHash} />
            )}
          </div>
        </StepCard>

        <StepCard
          step={3}
          title="Register hash on-chain"
          description="Writes the SHA-256 image digest to the StegaChain contract — an immutable provenance record."
          disabled={!imageHash}
        >
          {!isConnected && (
            <p className="text-xs text-neutral-400 mb-3">
              Connect your wallet to log the hash.
            </p>
          )}
          {isConnected && !isCorrectNetwork && (
            <p className="text-xs text-neutral-400 mb-3">
              Switch to the correct network to continue.
            </p>
          )}
          <div className="space-y-3">
            <button
              className="btn-primary w-full sm:w-auto"
              onClick={handleLogHash}
              disabled={
                !imageHash ||
                !isConnected ||
                !isCorrectNetwork ||
                isSubmitting ||
                isConfirmed
              }
            >
              {isSubmitting && <Spinner size="sm" />}
              {isConfirmed ? "✓ Logged" : "Log hash to blockchain"}
            </button>

            {txHash && (
              <div className="space-y-2">
                <HashDisplay label="Transaction hash" hex={txHash} />
                <a
                  href={`https://testnet.bscscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  View on BscScan ↗
                </a>
              </div>
            )}
          </div>
        </StepCard>
      </div>

      {lightboxOpen && stegoPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <span className="text-sm font-medium text-white">Stego image preview</span>
              <button
                className="btn-ghost px-2 py-1 text-xs"
                onClick={() => setLightboxOpen(false)}
              >
                ✕ Close
              </button>
            </div>
            <div className="bg-neutral-900 flex items-center justify-center p-4">
              <img
                src={stegoPreviewUrl}
                alt="Stego image"
                className="max-h-[70vh] max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800">
              {imageHash && (
                <p className="font-mono text-xs text-neutral-500 truncate max-w-[60%]">
                  {imageHash.slice(0, 18)}…
                </p>
              )}
              <button className="btn-secondary ml-auto" onClick={handleDownload}>
                ⬇ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

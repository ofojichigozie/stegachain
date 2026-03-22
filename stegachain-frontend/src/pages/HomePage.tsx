import { Link } from "react-router-dom";
import logo from "@/assets/stegachain-logo.png";

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="mb-6">
        <img src={logo} alt="StegaChain Logo" className="w-16 h-16 mx-auto mb-4" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">StegaChain</h1>
      <p className="text-neutral-400 text-lg max-w-md mb-2">
        Secure steganographic data transmission verified on the blockchain.
      </p>
      <p className="text-neutral-600 text-sm max-w-sm mb-10">
        Encrypt a secret, hide it inside an image, and register the image hash on-chain —
        so the receiver can verify it was never tampered with.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/send" className="btn-primary text-base px-8 py-3">
          I'm a Sender
        </Link>
        <Link to="/receive" className="btn-secondary text-base px-8 py-3">
          I'm a Receiver
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl text-left">
        {[
          {
            icon: "🔒",
            title: "AES-256-GCM",
            body: "Military-grade encryption. The key never leaves your browser.",
          },
          {
            icon: "🖼️",
            title: "LSB Steganography",
            body: "Payload hidden in pixel data. Visually indistinguishable from the original.",
          },
          {
            icon: "⛓️",
            title: "On-chain Verification",
            body: "SHA-256 image hash stored immutably on Ethereum. Tamper-proof provenance.",
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="card">
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

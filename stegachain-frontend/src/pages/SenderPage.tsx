import { Link } from "react-router-dom";
import { SenderFlow } from "@/components/SenderFlow";

export function SenderPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="btn-ghost text-xs mb-3 inline-flex">
          ← Back
        </Link>
        <h2 className="text-2xl font-bold">Sender</h2>
        <p className="text-sm text-gray-500 mt-1">
          Encrypt a secret, embed it into a cover image, and register the hash on-chain.
        </p>
      </div>
      <SenderFlow />
    </div>
  );
}

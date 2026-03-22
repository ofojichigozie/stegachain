import { Link } from "react-router-dom";
import { ReceiverFlow } from "@/components/ReceiverFlow";

export function ReceiverPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="btn-ghost text-xs mb-3 inline-flex">
          ← Back
        </Link>
        <h2 className="text-2xl font-bold">Receiver</h2>
        <p className="text-sm text-gray-500 mt-1">
          Extract and decrypt the hidden message, then verify the image integrity against
          the blockchain.
        </p>
      </div>
      <ReceiverFlow />
    </div>
  );
}

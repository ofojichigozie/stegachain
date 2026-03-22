import { NavLink } from "react-router-dom";
import { WalletButton } from "@/components/WalletButton";
import logo from "@/assets/stegachain-logo.png";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 bg-black/80 backdrop-blur sticky top-0 z-10">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <NavLink
              to="/"
              className="font-bold tracking-tight text-white flex items-center gap-2 shrink-0"
            >
              <img src={logo} alt="StegaChain Logo" className="w-6 h-6" />
              <span>StegaChain</span>
            </NavLink>

            <div className="hidden sm:flex items-center gap-2">
              <NavLink
                to="/send"
                className={({ isActive }) =>
                  `btn-ghost text-sm ${isActive ? "text-white" : ""}`
                }
              >
                Send
              </NavLink>
              <NavLink
                to="/receive"
                className={({ isActive }) =>
                  `btn-ghost text-sm ${isActive ? "text-white" : ""}`
                }
              >
                Receive
              </NavLink>
              <div className="ml-2">
                <WalletButton />
              </div>
            </div>

            <div className="sm:hidden">
              <WalletButton />
            </div>
          </div>

          <div className="sm:hidden flex border-t border-neutral-900">
            <NavLink
              to="/send"
              className={({ isActive }) =>
                `flex-1 py-2 text-center text-sm font-medium ${
                  isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                }`
              }
            >
              Send
            </NavLink>
            <NavLink
              to="/receive"
              className={({ isActive }) =>
                `flex-1 py-2 text-center text-sm font-medium ${
                  isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                }`
              }
            >
              Receive
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-600 space-y-1">
        <p>StegaChain — MSc Prototype · All crypto operations run client-side only</p>
        <p>Nnamdi Valentine Chikadibia · Teesside University</p>
      </footer>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

type UserDropdownProps = {
  user: {
    name: string;
    email: string;
  };
};

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isGuest = user.email.endsWith("@guest.local");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "G";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary border border-primary/40 hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        title={user.name || user.email}
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-border/80 bg-card p-3 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border/60 mb-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              {isGuest && (
                <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                  Guest
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isGuest ? "Guest Access" : user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <LogOutIcon className="size-4" />
            <span>{isLoggingOut ? "Leaving session..." : "Exit Session"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

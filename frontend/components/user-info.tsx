"use client";

import { useAuth } from "@/context/authContext";
import React, { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Wallet } from "lucide-react";
import Link from "next/link";

function CountUp({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // If we're already at the end value, don't animate unnecessarily
    // but we need to handle the initial case where count is 0 and end is actually 0.
    // However, usually end will be > 0 initially.
    // Let's just animate any change.

    // Store previous value to animate from there
    const start = countRef.current;
    if (start === end) return;

    // requestAnimationFrame loop
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function (easeOutExpo) for smooth landing
      const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      const currentCount = Math.floor(start + (end - start) * ease(percentage));
      setCount(currentCount);
      countRef.current = currentCount;

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we land exactly on end
        countRef.current = end;
        startTimeRef.current = null; // Reset for next animation
      }
    };

    requestAnimationFrame(animate);

    // Cleanup not strictly necessary for rAF in this simple case but good practice
    return () => {
      startTimeRef.current = null;
    };
  }, [end, duration]);

  // Handle initial load to jump instantly if preferred, but animation is fine too.
  // We'll trust the effect to handle updates.

  return <>{count.toLocaleString()}</>;
}

export default function UserInfo() {
  const { user, updateUserBalance } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    console.log("UserInfo: user updated", user);
    if (user) {
      setBalance(user.balance);
    }
  }, [user]);

  useEffect(() => {
    function onBalanceChanged({ amountPlaced }: { amountPlaced: number }) {
      setBalance((prev) => prev - amountPlaced);
    }

    function onPayoutGenerated({ allPayouts }: { allPayouts: any }) {
      console.log("Payout data:", allPayouts);
      if (user && allPayouts && Array.isArray(allPayouts)) {
        // Show toaster for each win
        allPayouts.forEach((payout: any) => {
          if (payout.userId == user._id) {
            toast.success(`You won ${payout.amount} coins!`, {
              description: "Balance updated",
              className: "!p-6 !text-lg !w-full !max-w-md", // Increase padding, text size, and width
              duration: 5000,
            });
          }
        });

        // Update balance
        const userPayouts = allPayouts.filter((p: any) => p.userId == user._id);
        if (userPayouts.length > 0) {
          const latestPayout = userPayouts.sort(
            (a: any, b: any) => b.newBalance - a.newBalance
          )[0];
          updateUserBalance(latestPayout.newBalance);
        }
      }
    }

    socket.on("balance-changed", onBalanceChanged);
    socket.on("payout-generated", onPayoutGenerated);

    return () => {
      socket.off("balance-changed", onBalanceChanged);
      socket.off("payout-generated", onPayoutGenerated);
    };
  }, [user]);

  return (
    <div className="flex items-center gap-4">
      {/* Balance Ring */}
      <div className="relative group">
        <div className="absolute -inset-0.5 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
        <div className="relative flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <p className="font-mono text-emerald-400 font-bold tracking-wider">
            $<CountUp end={balance} />
          </p>
        </div>
      </div>

      {/* User Profile */}
      <Link
        href={`/user/${user?._id}`}
        className="flex items-center gap-3 bg-white/5 rounded-full pl-2 pr-4 py-1 border border-white/5"
      >
        <Avatar className="h-8 w-8 border border-white/10">
          <AvatarFallback className="bg-brand-blue text-white">
            {user?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
        <p className="capitalize text-sm font-medium text-white/90">
          {user?.username}
        </p>
      </Link>
    </div>
  );
}

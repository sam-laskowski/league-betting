"use client";

import { useAuth } from "@/context/authContext";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function UserHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      try {
        const res = await fetch("http://localhost:3000/api/bet/getallbets");
        if (!res.ok) throw new Error("Failed to fetch bets");

        const allBets = await res.json();

        // Filter bets where the user has placed a prediction
        const userBets = allBets.filter(
          (bet: any) =>
            bet.placedBets &&
            bet.placedBets.some((pb: any) => pb.userId === user._id)
        );

        // Map to a friendlier format if needed, or just use as is in render
        setHistory(userBets);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  if (!user) return null;
  if (loading)
    return (
      <div className="text-white/50 text-center p-4">Loading history...</div>
    );
  if (history.length === 0)
    return (
      <div className="text-white/50 text-center p-4">
        No betting history found.
      </div>
    );

  return (
    <Card className="w-3/5 bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-xl text-white font-bold">
          Betting History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-screen pr-4">
          <div className="space-y-4">
            {history.map((bet) => {
              // Find the specific prediction the user made on this bet
              const userPrediction = bet.placedBets.find(
                (pb: any) => pb.userId === user._id
              );

              if (!userPrediction) return null; // Should not happen due to filter

              // Determine status
              // bet.outcome is boolean (true/false) or null if pending
              // userPrediction.prediction is likely a string "true"/"false" or boolean

              // Normalize prediction to boolean for comparison
              const predictionBool =
                userPrediction.prediction === "true" ||
                userPrediction.prediction === true;

              let status = "pending";
              if (bet.hasBeenPaidOut && bet.outcome !== null) {
                status = bet.outcome === predictionBool ? "won" : "lost";
              }

              return (
                <div
                  key={bet._id}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-black/20 border border-white/5"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-slate-300">
                        {bet.betType.amount} {bet.betType.operator}{" "}
                        {bet.betType.type}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">You voted:</span>
                        <Badge
                          variant="outline"
                          className={`${
                            predictionBool
                              ? "border-blue-500 text-blue-400"
                              : "border-fuchsia-500 text-fuchsia-400"
                          }`}
                        >
                          {predictionBool ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 font-mono text-emerald-400">
                        <span className="text-xs text-slate-500">$</span>
                        {userPrediction.amount}
                      </div>

                      {status === "pending" && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex gap-1 items-center"
                        >
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                      {status === "won" && (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-500 border-green-500/20 flex gap-1 items-center"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Won
                        </Badge>
                      )}
                      {status === "lost" && (
                        <Badge
                          variant="secondary"
                          className="bg-red-500/10 text-red-500 border-red-500/20 flex gap-1 items-center"
                        >
                          <XCircle className="w-3 h-3" /> Lost
                        </Badge>
                      )}
                    </div>
                  </div>

                  {bet.hasBeenPaidOut && (
                    <div className="text-xs text-slate-500 pt-2 border-t border-white/5 mt-1">
                      Outcome:{" "}
                      <span
                        className={
                          bet.outcome ? "text-blue-400" : "text-fuchsia-400"
                        }
                      >
                        {bet.outcome ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

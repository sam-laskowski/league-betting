import React from "react";

export default function PredictionsList({
  predictions,
  players,
}: {
  predictions: any;
  players: any[];
}) {
  function getUsername(userId: string) {
    const player = players.find((p) => p._id === userId);
    return player ? player.username : "Unknown Player";
  }

  function getSideText(prediction: boolean | string) {
    // Handle both boolean true/false and string "true"/"false" if likely
    const isYes =
      prediction === true || prediction === "true" || prediction === "Yes";
    return isYes ? "Yes" : "No";
  }

  return (
    <div className="space-y-2">
      {predictions.map((prediction: any, idx: number) => {
        const username = getUsername(prediction.userId);
        const side = getSideText(prediction.prediction);
        const isYes = side === "Yes";
        return (
          <div
            key={idx}
            className="flex items-center justify-between text-sm p-2 rounded bg-white/5 border border-white/5"
          >
            <p className="text-slate-300">
              <span className="font-semibold text-white capitalize">
                {username}
              </span>{" "}
              placed{" "}
              <span className="text-emerald-400 font-mono">
                ${prediction.amount}
              </span>{" "}
              on{" "}
              <span
                className={`font-bold ${
                  isYes ? "text-blue-400" : "text-fuchsia-400"
                }`}
              >
                {side}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

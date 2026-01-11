"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import PredictionsList from "./predictions-list";
import PlacePredictionButton from "./place-prediction-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BetList({
  user,
  currPlayer,
  players,
}: {
  user: User | null;
  currPlayer?: any;
  players: any[];
}) {
  const { roomId } = useParams();
  const [bets, setBets] = useState<any>([]);

  useEffect(() => {
    const fetchBets = async () => {
      const response = await fetch(
        `http://localhost:3000/api/bet/getbetsforroomid/${roomId}`
      );
      const data = await response.json();
      const betsData = Array.from(data);
      setBets(betsData);
    };
    fetchBets();
  }, [roomId]);

  useEffect(() => {
    const handleBetCreated = ({
      roomId: eventRoomId,
      bet,
    }: {
      roomId: string;
      bet: any;
    }) => {
      if (eventRoomId === roomId) {
        setBets((prevBets: any[]) => [...prevBets, bet]);
      }
    };
    const handlePredictionPlaced = ({
      roomId: eventRoomId,
      bet: updatedBet,
    }: {
      roomId: string;
      bet: any;
    }) => {
      if (eventRoomId === roomId) {
        console.log("Prediction placed:", updatedBet);
        setBets((prevBets: any[]) =>
          prevBets.map((bet: any) =>
            bet._id === updatedBet._id ? updatedBet : bet
          )
        );
      }
    };

    socket.on("bet-created", handleBetCreated);
    socket.on("prediction-placed", handlePredictionPlaced);

    return () => {
      socket.off("bet-created", handleBetCreated);
      socket.off("prediction-placed", handlePredictionPlaced);
    };
  }, [roomId]);

  function getOperatorText(operator: string) {
    if (operator === ">=") return "or more";
    if (operator === "<=") return "or less";
    if (operator === "=") return "equal to";
    return operator;
  }

  function getUsername(userId: string) {
    const player = players.find((p) => p._id === userId);
    return player ? player.username : "Unknown Player";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {bets
        .filter((bet: any) => bet.forId !== user?._id)
        .map((bet: any) => {
          const hasPlacedPrediction =
            currPlayer?.placedPredictionOnIds?.includes(bet._id);
          const username = getUsername(bet.forId);
          const operatorText = getOperatorText(bet.betType.operator);

          return (
            <Card
              key={bet._id}
              className="bg-white/5 border-white/10 text-white overflow-hidden shadow-lg hover:shadow-brand-blue/20 transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-brand-blue/20 to-transparent pb-4">
                <CardTitle className="text-xl font-bold tracking-wide">
                  <span className="text-brand-blue-300 capitalize">
                    {username}
                  </span>{" "}
                  to get{" "}
                  <span className="text-brand-blue-300">
                    {bet.betType.amount}
                  </span>{" "}
                  or {operatorText} {bet.betType.type}.
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Current Pool:{" "}
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-brand-blue/20 text-brand-blue-200 border-none"
                  >
                    {bet.placedBets.length} Bets
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!hasPlacedPrediction ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-300">Choose your side:</p>
                    <PlacePredictionButton
                      betId={bet._id}
                      roomId={roomId as string}
                    />
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 text-center">
                    <p className="text-green-400 font-medium">
                      Prediction Placed
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-black/20 flex flex-col items-start gap-2 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Predictions Placed
                </p>
                <ScrollArea className="h-[125px] w-full rounded-md border border-white/5 bg-black/20 p-2">
                  <PredictionsList
                    predictions={bet.placedBets}
                    players={players}
                  />
                </ScrollArea>
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
}

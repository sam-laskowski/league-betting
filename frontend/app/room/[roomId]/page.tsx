"use client";

import BetList from "@/components/bet-list";
import PlayerList from "@/components/player-list";
import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import AssignPlayers from "@/components/assign-players";
import CreateBetButton from "@/components/create-bet-button";
import PayoutButton from "@/components/payout-button";

export default function RoomPage() {
  const { roomId } = useParams();
  const [currRoomId, setCurrRoomId] = useState<string>(roomId as string);
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [roomState, setRoomState] = useState<any>({});
  const [createdBetThisRound, setCreatedBetThisRound] =
    useState<boolean>(false);
  const [assignedPlayerId, setAssignedPlayerId] = useState<string | null>(null);
  const [currPlayer, setCurrPlayer] = useState<any>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onRoomState(room: any) {
      setRoomState(room);
      if (room && room.players) {
        setPlayers(room.players);
        const player = room.players.filter((p: any) => p._id === user?._id);
        setCurrPlayer(player[0]);
      }
    }

    function onBetCreated({ room }: { room: any }) {
      onRoomState(room);
    }

    socket.on("room-state", onRoomState);
    socket.on("bet-created", onBetCreated);

    if (socket.connected && user) {
      socket.emit("join-room", { roomId, user });
    }

    return () => {
      socket.off("room-state", onRoomState);
      socket.off("bet-created", onBetCreated);
    };
  }, [user, roomId]);

  useEffect(() => {
    return () => {
      if (currRoomId !== roomId) {
        console.log("Leaving room cause of navigation:");
        socket.emit("leave-room", { roomId: currRoomId });
      }
    };
  }, [currRoomId, roomId]);

  return (
    <>
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Room Code: {currRoomId}
          </h1>
          {!roomState.havePlayersAssigned && (
            <AssignPlayers
              roomId={currRoomId}
              onAssign={() => setCreatedBetThisRound(false)}
              assignedPlayerId={assignedPlayerId}
              setAssignedPlayerId={setAssignedPlayerId}
            />
          )}
          {assignedPlayerId && (
            <p className="text-lg font-medium">
              Create a bet for{" "}
              <span className="text-primary font-bold">
                {players.find((p) => p._id === assignedPlayerId)?.username ||
                  assignedPlayerId}
              </span>
            </p>
          )}
          {currPlayer &&
            roomState.havePlayersAssigned &&
            !currPlayer.createdBetThisRound && (
              <CreateBetButton
                user={user}
                assignedPlayerId={assignedPlayerId}
              />
            )}
          <BetList
            user={user}
            currPlayer={currPlayer}
            players={players}
          />
          <PayoutButton />
        </div>
        <div className="lg:col-span-1">
          <PlayerList players={players} />
        </div>
      </div>
    </>
  );
}

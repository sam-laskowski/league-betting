"use client";

import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";

export default function AssignPlayers({
  roomId,
  onAssign,
  assignedPlayerId,
  setAssignedPlayerId,
}: {
  roomId: string;
  onAssign: () => void;
  assignedPlayerId: string | null;
  setAssignedPlayerId: (id: string | null) => void;
}) {
  const handleAssignPlayers = () => {
    socket.emit("generate-for-player", { roomId });
    onAssign();
  };

  useEffect(() => {
    socket.on("player-assigned-to", (data) => {
      console.log(data);
      setAssignedPlayerId(data.forId);
    });
    return () => {
      socket.off("player-assigned-to");
    };
  }, [socket]);

  return (
    <div>
      <Button onClick={handleAssignPlayers}>Assign Players</Button>
    </div>
  );
}

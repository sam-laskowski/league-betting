"use client";
import { socket } from "@/lib/socket";
import React, { useActionState, useEffect } from "react";
import { Button } from "./ui/button";
import { createBet } from "@/actions/actions";
import { useParams } from "next/navigation";

export default function CreateBetForm({
  user,
  assignedPlayerId,
}: {
  user: any;
  assignedPlayerId: string | null;
}) {
  const { roomId } = useParams();
  const [state, createBetAction, pending] = useActionState(
    createBet,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      console.log("emmiting create-bet");
      socket.emit("create-bet", { roomId: state.roomId, bet: state.bet });
    }
  }, [state]);

  return (
    <div>
      <form action={createBetAction}>
        <input
          type="hidden"
          name="roomId"
          value={roomId}
        />
        <input
          type="hidden"
          name="createdId"
          value={user._id}
        />
        <input
          type="hidden"
          name="forId"
          value={assignedPlayerId!}
        />
        <select
          name="type"
          id=""
        >
          <option value="kills">Kills</option>
          <option value="deaths">Deaths</option>
        </select>
        <input
          type="number"
          name="amount"
          id=""
        />
        <select
          name="operator"
          id=""
        >
          <option value="greater">Greater Than</option>
          <option value="less">Less Than</option>
          <option value="equal">Equal To</option>
        </select>
        <Button type="submit">Create Bet</Button>
      </form>
    </div>
  );
}

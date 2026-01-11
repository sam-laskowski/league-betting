import { useParams } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import { socket } from "@/lib/socket";

export default function PayoutButton() {
  const { roomId } = useParams();

  const payout = async () => {
    const response = await fetch(
      `http://localhost:3000/api/bet/generateRandomBetPayouts/${roomId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }),
      }
    );
    const data = await response.json();

    socket.emit("payout-generated", { roomId: roomId, allPayouts: data });
    return data;

    return data;
  };
  return (
    <div>
      <Button onClick={payout}>Payout</Button>
    </div>
  );
}

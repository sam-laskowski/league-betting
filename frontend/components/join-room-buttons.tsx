"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

interface RoomButtonsProps {
  userId?: string;
}

export default function RoomButtons({ userId }: RoomButtonsProps) {
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch user details to get username
    if (userId) {
      fetch(`http://localhost:3000/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUsername(data.username);
          // Connect socket once we have user data
          if (!socket.connected) {
            socket.connect();
          }
        })
        .catch((err) => console.error("Failed to fetch user:", err));
    }

    // Socket event listeners
    function onRoomCreated({ roomId }: { roomId: string }) {
      console.log("Room created:", roomId);
      // Construct the URL with query parameters
      const url = `/room/${roomId}`;
      router.push(url);
    }

    function onRoomJoined({ roomId }: { roomId: string }) {
      console.log("Room joined:", roomId);
      const url = `/room/${roomId}`;
      router.push(url);
    }

    function onError(message: string) {
      alert(message);
    }

    socket.on("room-created", onRoomCreated);
    socket.on("room-joined", onRoomJoined);
    socket.on("error", onError);

    return () => {
      socket.off("room-created", onRoomCreated);
      socket.off("room-joined", onRoomJoined);
      socket.off("error", onError);
      // socket.disconnect(); // Keep connection alive for now or handle in a global context
    };
  }, [userId, username, router]);

  const handleCreateRoom = () => {
    if (!username) return alert("Loading user data...");
    socket.emit("create-room", { user: { username, _id: userId } });
  };

  const handleJoinRoom = () => {
    if (!username) return alert("Loading user data...");
    if (!roomIdToJoin) return alert("Please enter a room ID");
    socket.emit("join-room", {
      roomId: roomIdToJoin,
      user: { username, _id: userId },
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md items-center">
      <Button
        onClick={handleCreateRoom}
        className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white h-14 text-lg rounded-full shadow-[0_0_20px_rgba(0,26,108,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,26,108,0.7)] border-none"
      >
        Create Room
      </Button>

      <div className="flex gap-2 w-full">
        <Input
          placeholder="Enter Room ID"
          value={roomIdToJoin}
          onChange={(e) => setRoomIdToJoin(e.target.value)}
          className="h-14 rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-brand-blue focus-visible:border-brand-blue"
        />
        <Button
          onClick={handleJoinRoom}
          variant="outline"
          className="h-14 px-8 rounded-full border-brand-blue text-brand-blue hover:text-white hover:bg-brand-blue backdrop-blur-sm transition-all hover:scale-105 bg-transparent shadow-[0_0_15px_rgba(0,26,108,0.2)]"
        >
          Join
        </Button>
      </div>
    </div>
  );
}

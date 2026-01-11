"use client";

import React from "react";
import { User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Player {
  username: string;
  socketId?: string;
  _id?: string;
  avatar?: string;
  email?: string;
}

interface PlayerListProps {
  players: Player[];
  limit?: number;
}

export default function PlayerList({ players, limit }: PlayerListProps) {
  const displayPlayers = limit ? players.slice(0, limit) : players;

  return (
    <Card className="w-full bg-background/50 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Active Players
            </span>
          </CardTitle>
          <Badge
            variant="outline"
            className="px-3 py-1 font-mono text-xs"
          >
            {players.length} Online
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {players.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <User className="h-8 w-8 opacity-20" />
            <p>Waiting for players to join...</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] w-full pr-4">
            <div className="flex flex-col gap-3">
              {displayPlayers.map((player, index) => (
                <div
                  key={player.socketId || player._id || index}
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-primary/20"
                >
                  <Avatar className="h-10 w-10 border border-border shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarImage
                      src={player.avatar}
                      alt={player.username}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {player.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {player.username}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

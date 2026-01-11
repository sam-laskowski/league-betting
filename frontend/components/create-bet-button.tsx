"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import CreateBetForm from "./create-bet-form";

export default function CreateBetButton({
  user,
  assignedPlayerId,
}: {
  user: any;
  assignedPlayerId: string | null;
}) {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">Create Bet</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bet for</DialogTitle>
          </DialogHeader>
          <CreateBetForm
            user={user}
            assignedPlayerId={assignedPlayerId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useEffect, useActionState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { predict } from "@/actions/actions";
import { socket } from "@/lib/socket";
import { Input } from "./ui/input";

export default function PlaceBetButton({
  betId,
  roomId,
}: {
  betId: string;
  roomId: string;
}) {
  const [state, predictAction, pending] = useActionState(predict, undefined);

  useEffect(() => {
    if (state?.success) {
      console.log("emmitting place-prediction");
      socket.emit("place-prediction", {
        roomId: state.roomId,
        bet: state.bet,
        amount: state.amount,
      });
      toast.success("Prediction placed!");
    } else {
      toast.error(state?.error || "Something went wrong");
    }
  }, [state]);

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {/* YES Side - Blue */}
      <form
        action={predictAction}
        className="flex flex-col gap-2 p-3 rounded-lg border border-blue-500/20"
      >
        <p className="text-center font-bold text-blue-400">YES</p>
        <div className="flex w-full">
          <Input
            type="number"
            name="amount"
            defaultValue={0}
            placeholder="Amount"
            className="rounded-r-none bg-blue-950/30 border-blue-500/30 border-r-0 text-blue-100 placeholder:text-blue-500/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <input
            type="hidden"
            name="prediction"
            value="true"
          />
          <input
            type="hidden"
            name="betId"
            value={betId}
          />
          <input
            type="hidden"
            name="roomId"
            value={roomId}
          />
          <Button
            type="submit"
            className="rounded-l-none bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            disabled={pending}
          >
            {pending ? "..." : "Vote"}
          </Button>
        </div>
      </form>

      {/* NO Side - Pink/Purple */}
      <form
        action={predictAction}
        className="flex flex-col gap-2 p-3 rounded-lg border border-fuchsia-500/20"
      >
        <p className="text-center font-bold text-fuchsia-400">NO</p>
        <div className="flex w-full">
          <Input
            type="number"
            name="amount"
            defaultValue={0}
            placeholder="Amount"
            className="rounded-r-none bg-fuchsia-950/30 border-fuchsia-500/30 border-r-0 text-fuchsia-100 placeholder:text-fuchsia-500/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <input
            type="hidden"
            name="prediction"
            value="false"
          />
          <input
            type="hidden"
            name="betId"
            value={betId}
          />
          <input
            type="hidden"
            name="roomId"
            value={roomId}
          />
          <Button
            type="submit"
            className="rounded-l-none bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-none shadow-[0_0_10px_rgba(192,38,211,0.3)] hover:shadow-[0_0_15px_rgba(192,38,211,0.5)]"
            disabled={pending}
          >
            {pending ? "..." : "Vote"}
          </Button>
        </div>
      </form>
    </div>
  );
}

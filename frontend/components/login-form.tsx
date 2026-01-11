"use client";
import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <div className="flex justify-center items-center w-full">
      <form
        action={loginAction}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="ml-1 text-white/80"
            >
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              className="h-12 rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-brand-blue focus-visible:border-brand-blue"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="ml-1 text-white/80"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              className="h-12 rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-brand-blue focus-visible:border-brand-blue"
            />
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      className="w-full h-12 text-lg rounded-full bg-brand-blue hover:bg-brand-blue/80 text-white shadow-[0_0_20px_rgba(0,26,108,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,26,108,0.7)] border-none"
    >
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}

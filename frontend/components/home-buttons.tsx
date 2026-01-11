"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";
import { useAuth } from "@/context/authContext";

import RoomButtons from "@/components/join-room-buttons";

export default function HomeButtons() {
  const { isAuthenticated, userId } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-6 mt-8 w-full justify-center">
      {isAuthenticated ? (
        <RoomButtons userId={userId} />
      ) : (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/80 text-white min-w-[140px] h-14 text-lg rounded-full shadow-[0_0_20px_rgba(0,26,108,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,26,108,0.7)] border-none">
                Login
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
              </DialogHeader>
              <LoginForm />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white min-w-[140px] h-14 text-lg rounded-full backdrop-blur-sm transition-all hover:scale-105 bg-white/5"
              >
                Register
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Register</DialogTitle>
              </DialogHeader>
              <RegisterForm />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

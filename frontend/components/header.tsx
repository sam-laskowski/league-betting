"use client";

import React from "react";
import { Button } from "./ui/button";
// import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import { useAuth } from "@/context/authContext";
import UserInfo from "./user-info";
import Link from "next/link";
import { Home } from "lucide-react";

export default function Header() {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <header className="flex justify-end gap-2 mt-4 pr-4">
      {isAuthenticated ? (
        <>
          <Link href="/">
            <Button variant="outline">
              <Home />
            </Button>
          </Link>
          <UserInfo />
          <Button
            onClick={handleLogout}
            variant="outline"
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">Login</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
              </DialogHeader>
              <LoginForm />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Register</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register</DialogTitle>
              </DialogHeader>
              <RegisterForm />
            </DialogContent>
          </Dialog>
        </>
      )}
    </header>
  );
}

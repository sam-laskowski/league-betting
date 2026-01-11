"use server";

import { FormState, RegisterFormSchema } from "@/lib/definitions";
import { decrypt, verifySession } from "@/lib/session";
import { socket } from "@/lib/socket";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function register(state: FormState, formData: FormData) {
  console.log(formData);

  const validateFields = RegisterFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  // if any form fields invalid return early
  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  let loginSuccessful = false;
  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register: CUSTOM");
    }
    // console.log(response); // raw response object

    const data = await response.json(); // parse JSON body to access the token

    console.log("token recieved", data.token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    // creatSession()
    (await cookies()).set("session", data.token, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
    });
    loginSuccessful = true;
  } catch (error: any) {
    console.error(error);
  }
  if (loginSuccessful) redirect("/");
}

export async function login(prevState: any, formData: FormData) {
  let loginSuccessful = false;
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    if (!response.ok) {
      console.log(response);
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to login: CUSTOM");
    }
    // console.log(response); // raw response object

    const data = await response.json(); // parse JSON body to access the token

    console.log("token recieved", data.token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    // creatSession()
    (await cookies()).set("session", data.token, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
    });
    loginSuccessful = true;
  } catch (error: any) {
    console.error(error);
  }
  if (loginSuccessful) redirect("/");
}

export async function logout() {
  let logoutSuccessful = false;
  try {
    // clear session cookie
    (await cookies()).set("session", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    });
    logoutSuccessful = true;
  } catch (e: any) {
    console.error("Failed to logout", e);
  }
  //if (logoutSuccessful) redirect("/");
}

export async function auth() {
  const session = await verifySession();
  return !!session;
}

export async function getUserId() {
  const cookie = (await cookies()).get("session");
  const session = await decrypt(cookie?.value);
  return session?.userId;
}

export async function createBet(prevState: any, formData: FormData) {
  try {
    const entryData = Object.fromEntries(formData);
    const bet = {
      createdId: entryData.createdId,
      forId: entryData.forId,
      betType: {
        type: entryData.type,
        amount: entryData.amount,
        operator: entryData.operator,
      },
      roomId: entryData.roomId,
    };
    console.log(bet);

    const response = await fetch("http://localhost:3000/api/bet/createbet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bet),
    });
    if (!response.ok) {
      console.log(response);
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create bet");
    }

    const data = await response.json();

    console.log("bet created", data);
    return { success: true, bet: data, roomId: entryData.roomId };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function predict(prevState: any, formData: FormData) {
  try {
    const entryData = Object.fromEntries(formData);
    const userId = await getUserId();
    const betId = entryData.betId;
    const prediction = entryData.prediction;
    const amount = entryData.amount;
    const predictionData = {
      betId: betId,
      userId: userId,
      amount: amount,
      prediction: prediction,
    };

    const response = await fetch("http://localhost:3000/api/bet/placebet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(predictionData),
    });
    if (!response.ok) {
      console.log(response);
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const bet = await response.json();

    return {
      success: true,
      bet: bet,
      roomId: entryData.roomId,
      amount: Number(amount),
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

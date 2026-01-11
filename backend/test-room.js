const { io } = require("socket.io-client");

const URL = "http://localhost:3000";

const socket1 = io(URL, { autoConnect: false });
const socket2 = io(URL, { autoConnect: false });

async function testRooms() {
  try {
    console.log("Connecting users...");
    socket1.connect();
    socket2.connect();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // User 1 creates a room
    console.log("User 1 creating room...");
    socket1.emit("create-room", { user: { username: "User1" } });

    let roomId;

    socket1.on("room-created", (data) => {
      roomId = data.roomId;
      console.log("Room created:", roomId);

      // User 2 joins the room
      console.log("User 2 joining room...");
      socket2.emit("join-room", { roomId, user: { username: "User2" } });
    });

    socket1.on("room-state", (room) => {
      console.log("Room State (User 1 view):", room);
      if (room.players.length === 2) {
          console.log("SUCCESS: Both players in room!");
          cleanup();
      }
    });

    socket2.on("room-state", (room) => {
      console.log("Room State (User 2 view):", room);
    });

    socket2.on("error", (err) => {
        console.error("User 2 Error:", err);
    });

  } catch (error) {
    console.error("Error:", error);
  }
}

function cleanup() {
    socket1.disconnect();
    socket2.disconnect();
    process.exit(0);
}

testRooms();

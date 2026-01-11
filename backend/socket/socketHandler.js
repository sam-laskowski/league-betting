const { v4: uuidv4 } = require("uuid");

const rooms = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create-room", ({ user }) => {
      const roomId = uuidv4().substring(0, 6).toUpperCase(); // Short ID
      rooms.set(roomId, {
        id: roomId,
        havePlayersAssigned: false,
        players: [
          {
            ...user,
            socketId: socket.id,
            createdBetThisRound: false,
            placedPredictionOnIds: [],
          },
        ],
      });

      socket.join(roomId);
      socket.emit("room-created", { roomId });
      io.to(roomId).emit("room-state", rooms.get(roomId));
      console.log(`Room created: ${roomId} by ${user.username}`);
    });

    socket.on("join-room", ({ roomId, user }) => {
      const room = rooms.get(roomId);

      if (!room) {
        return socket.emit("error", "Room not found");
      }

      if (room.players.length >= 5) {
        return socket.emit("error", "Room is full");
      }

      // Check if user is already in the room
      const existingPlayer = room.players.find(
        (p) => p.username === user.username
      );
      if (existingPlayer) {
        // Update socket ID if rejoining
        existingPlayer.socketId = socket.id;
      } else {
        room.players.push({
          ...user,
          socketId: socket.id,
          createdBetThisRound: false,
          placedPredictionOnIds: [],
        });
      }

      socket.join(roomId);
      socket.emit("room-joined", { roomId });
      io.to(roomId).emit("room-state", room);
      console.log(`User ${user.username} joined room ${roomId}`);
    });

    socket.on("leave-room", ({ roomId }) => {
      handleLeave(socket, roomId, io);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Find which room the socket was in and update their status (optional)
      // We do NOT remove them so that state (like createdBetThisRound) persists on refresh
      rooms.forEach((room) => {
        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          // player.online = false; // could eventually mark them as offline
          console.log(
            `User ${player.username} disconnected but remains in room`
          );
        }
      });
    });

    socket.on("create-bet", ({ roomId, bet }) => {
      const room = rooms.get(roomId);
      const player = room.players.find((p) => p.socketId === socket.id);
      if (!room) {
        return socket.emit("error", "Room not found");
      }
      if (player.createdBetThisRound) {
        return socket.emit(
          "error",
          "You have already created a bet this round"
        );
      }
      player.createdBetThisRound = true;
      io.to(roomId).emit("bet-created", { roomId, bet, room });
    });

    socket.on("place-prediction", ({ roomId, bet, amount }) => {
      const room = rooms.get(roomId);
      if (!room) {
        return socket.emit("error", "Room not found");
      }
      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player) {
        return socket.emit("error", "Player not found");
      }
      if (player.placedPredictionOnIds.includes(bet._id)) {
        return socket.emit(
          "error",
          "You have already placed a prediction on this bet"
        );
      }
      player.placedPredictionOnIds.push(bet._id);
      io.to(roomId).emit("prediction-placed", { roomId, bet });
      io.to(player.socketId).emit("balance-changed", {
        amountPlaced: amount,
      });
      io.to(roomId).emit("room-state", room);
    });

    socket.on("generate-for-player", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) {
        return socket.emit("error", "Room not found");
      }
      if (room.havePlayersAssigned) {
        return socket.emit("error", "Players have already been assigned");
      }
      const players = room.players;
      const numPlayers = players.length;

      if (numPlayers < 2) {
        return socket.emit("error", "Not enough players to assign");
      }

      for (let i = 0; i < numPlayers; i++) {
        const player = players[i];
        // Assign next player in the list, wrapping around to the start
        const targetIndex = (i + 1) % numPlayers;
        const targetPlayer = players[targetIndex];

        io.to(player.socketId).emit("player-assigned-to", {
          roomId,
          forId: targetPlayer._id,
        });
      }
      room.havePlayersAssigned = true;
      io.to(roomId).emit("room-state", room);
    });
    socket.on("payout-generated", ({ roomId, allPayouts }) => {
      io.to(roomId).emit("payout-generated", { allPayouts });
    });
  });
};

function handleLeave(socket, roomId, io) {
  const room = rooms.get(roomId);
  if (room) {
    room.players = room.players.filter((p) => p.socketId !== socket.id);
    socket.leave(roomId);

    io.to(roomId).emit("room-state", room);
    console.log(`User left room ${roomId}`);
  }
}

module.exports = socketHandler;

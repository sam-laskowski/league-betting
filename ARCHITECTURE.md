# Emporium Application Architecture

This document provides a technical overview of the Emporium full-stack application, detailing the architecture, database schemas, API endpoints, real-time interactions, and core logic handling.

## 1. Authorization and Authentication

Authentication is handled via **JWT (JSON Web Tokens)**.

- **Controller**: `backend/controllers/authController.js`
- **Mechanism**:
  - **Signup**: Users register with a `username` and `password`. The password is hashed using `bcrypt` before storage.
  - **Login**: Credentials are verified against the database. On success, a JWT is signed (containing the `userId`) and returned to the client along with user details.
  - **Token Expiry**: Tokens are set to expire in 1 hour.
  - **Security**: Passwords are never stored in plain text.

## 2. Database Schemas (MongoDB)

The application uses Mongoose to interact with a MongoDB database.

### User Model

- **File**: `backend/models/User.js`
- **Fields**:
  - `username` (String, Unique): The user's display name.
  - `password` (String): Hashed password.
  - `balance` (Number): Current currency balance (default: 0).
  - `bets` (Array): Storage for user-related bet history (default: empty).

### Bets Model

- **File**: `backend/models/Bets.js`
- **Fields**:
  - `createdId` (String): ID of the user who created the bet.
  - `forId` (String): ID of the target user (the subject of the bet).
  - `betType` (Object): Details describing the bet conditions.
  - `placedBets` (Array): List of bets placed on this event. containing:
    - `userId`: Who placed the bet.
    - `amount`: How much was wagered.
    - `prediction`: The anticipated outcome (e.g., "true"/"false").
  - `roomId` (String): The associated game room ID.
  - `hasBeenPaidOut` (Boolean): Flag to prevent double payouts.
  - `outcome` (Boolean): The final result of the bet (Null until resolved).

## 3. API Endpoints

The backend exposes RESTful API endpoints for data persistence and state management.

### Authentication (`/api/auth`)

- `POST /signup`: Register a new user.
- `POST /login`: Authenticate existing user.

### Users (`/api/users`)

- `GET /:id`: Fetch user profile (excluding password).
- `PUT /:id`: Update username or password.
- `DELETE /:id`: Delete a user account.

### Balance (`/api/balance`)

- `POST /addfunds`: Add currency to a user's account.

### Bets (`/api/bet`)

- `POST /createbet`: Initialize a new betting event.
- `POST /placebet`: Place a wager on an existing bet. (Handles balance deduction).
- `GET /getbetsforroomid/:roomId`: Retrieve all bets active in a specific room.
- `GET /getallbets`: Retrieve all bets in the system.
- `POST /generateRandomBetPayouts/:roomId`: **Legacy/Testing Endpoint**. Simulates outcomes for all unpaid bets in a room and processes payouts.

## 4. Socket.io Interactions

Real-time features (lobby management, bet broadcasting) are handled via Socket.io.

- **Handler**: `backend/socket/socketHandler.js`

### Client -> Server Events

- `create-room`: User creates a new game lobby.
- `join-room`: User joins an existing lobby.
- `create-bet`: Broadcasts a new bet to the room.
- `place-prediction`: Broadcasts that a user has wagered on a resolved bet.
- `generate-for-player`: Assigns targets (Round-robin) for players to create bets about.
- `payout-generated`: Notification that payouts have occurred.

### Server -> Client Events

- `room-created` / `room-joined`: Confirmation of room entry.
- `room-state`: Syncs the full state of the room (players, active bets) to clients.
- `bet-created`: Notifies room of a new betting opportunity.
- `prediction-placed`: Notifies room of a wager; triggers UI updates.
- `balance-changed`: Personal update to a user's client when their balance shifts (via socket interaction).
- `player-assigned-to`: Tells a specific user who they are targeting for the next bet.

## 5. User Balance Handling

Balance is a critical state managed transactionally.

1.  **Deduction (Wager)**:

    - When `POST /api/bet/placebet` is called:
      - Server verifies `user.balance >= amount`.
      - Deducts `amount` from `user.balance` immediately.
      - Saves the `User` document.
      - Updates the `Bet` document with the wager details.

2.  **Addition (Payout)**:

    - Managed by payout logic (e.g., `generateRandomBetPayouts` in `betsController.js`).
    - Server iterates through `placedBets` on a resolving `Bet`.
    - Calculates a **Winner's Share**: Total Loser Pool divided by Number of Winners.
    - **Payout Formula**: `Original Stake + Winner's Share`.
    - Server adds this calculated amount to the winning `User`'s balance and saves.

3.  **Synchronization**:
    - REST APIs handle the persistent database updates.
    - Socket events (`balance-changed`) are used to trigger immediate UI refreshes on the frontend without requiring a page reload.

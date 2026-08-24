# ⚡ Rydex Socket Server — Real-Time Event & Geolocation Engine

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_v9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Render Deployment](https://img.shields.io/badge/Render-Live_Server-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://rydex-socket-server-rgmq.onrender.com)
[![Vercel Client](https://img.shields.io/badge/Vercel-Client_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://rydex-roan.vercel.app)

> **Rydex Socket Server** is the dedicated real-time communication backbone for the Rydex vehicle booking ecosystem, created and architected by **Anmol Maurya (Amy)**. Built with **Express**, **Socket.IO**, and **Mongoose**, it powers bidirectional live GPS driver tracking, instant in-ride messaging, ride room dispatching, and cash transaction synchronization.

---

## 🌐 Live Deployments

| Service | Platform | Live URL | Status |
| :--- | :--- | :--- | :---: |
| **Rydex Socket Server** | **Render** | [https://rydex-socket-server-rgmq.onrender.com](https://rydex-socket-server-rgmq.onrender.com) | 🟢 Live |
| **Rydex Web App (Client)** | **Vercel** | [https://rydex-roan.vercel.app](https://rydex-roan.vercel.app) | 🟢 Live |

---

## 👨‍💻 Creator & Author

- **Creator & Lead Architect**: **Anmol Maurya** (Amy)
- **Project**: Rydex (Full-Stack Next-Gen Vehicle Booking & Ride Hailing System)

---

## 📑 Table of Contents

- [Live Deployments](#-live-deployments)
- [Creator & Author](#-creator--author)
- [Core Responsibilities](#-core-responsibilities)
- [How It Connects with Rydex Client](#-how-it-connects-with-rydex-client)
- [Real-Time Socket Events Reference](#-real-time-socket-events-reference)
- [REST Endpoints](#-rest-endpoints)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables](#-environment-variables)
- [Architecture & Workflow](#-architecture--workflow)
- [License](#-license)

---

## 🎯 Core Responsibilities

1. **User Identity & Online Status**: Maps active WebSocket IDs to authenticated MongoDB user profiles (`socketId`, `isOnline: true / false`).
2. **Live Driver Geolocation Tracking**: Receives high-frequency GPS coordinate broadcasts from drivers and broadcasts live position updates to the assigned rider.
3. **Dedicated Ride Rooms (`ride-{bookingId}`)**: Isolates communication (chat, location, state changes) into isolated socket rooms per active booking.
4. **In-Ride Instant Chat Relay**: Broadcasts messages between rider and driver instantly without database polling.
5. **Cash Payment Handshake**: Transmits cash payment requests, confirmations, and disputes in real time.
6. **Server-Side Event Push (`/emit`)**: Allows serverless Next.js API routes to push arbitrary socket events directly to targeted users by `userId`.

---

## 🔄 How It Connects with Rydex Client

```
┌───────────────────────────┐                    ┌────────────────────────────┐
│    Rydex Client (Next.js) │                    │  Rydex Socket Server (Node)│
│  https://rydex-roan.vercel.app                 │  https://rydex-socket-server...
└─────────────┬─────────────┘                    └─────────────┬──────────────┘
              │                                                │
              ├─────── 1. socket.emit("identity", userId) ─────► Sets isOnline: true in DB
              │                                                │
              ├─────── 2. socket.emit("join-ride", bookingId) ─► Joins room `ride-{id}`
              │                                                │
              ├─────── 3. socket.emit("driver-location-update")► Relays to room `ride-{id}`
              │                                                │
              ├─────── 4. socket.emit("new-message", chatData) ─► Relays to room `ride-{id}`
              │                                                │
              └─────── 5. socket.disconnect() ─────────────────► Sets isOnline: false in DB
```

---

## 📡 Real-Time Socket Events Reference

### Client-to-Server (`socket.on`)

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `identity` | `userId: string` | Binds current socket ID to the user document in MongoDB and marks user as active/online. |
| `update_coordinates` | `{ userId, lon, lat }` | Updates user's GeoJSON Point location in MongoDB. |
| `join-ride` | `bookingId: string` | Joins the caller's socket instance to room `ride-${bookingId}`. |
| `driver-location-update` | `{ bookingId, status, latitude, longitude }` | Broadcasts driver's updated coordinates and ride status to room `ride-${bookingId}` as `driver-location`. |
| `ride-confirmed` | `{ bookingId }` | Emits `ride-confirmed` to notify rider that their ride request was accepted. |
| `new-message` | `{ bookingId, sender, msg, time }` | Broadcasts new chat message to all participants in `ride-${bookingId}`. |
| `cash-request` | `{ bookingId }` | Emits `cash-requested` to prompt customer for cash payment. |
| `cash-received` | `{ bookingId }` | Emits `cash-received` to notify customer that cash was acknowledged by the driver. |
| `cash-declined` | `{ bookingId }` | Emits `cash-declined` to notify customer of payment dispute or cancellation. |
| `disconnect` | — | Automatically unsets `socketId` and flags `isOnline: false` in MongoDB upon connection termination. |

---

## 🌐 REST Endpoints

### 1. Direct Socket Emitter
- **Route**: `POST /emit`
- **Body**:
  ```json
  {
    "event": "ride-update",
    "userId": "64f8a123...",
    "data": { "status": "confirmed" }
  }
  ```
- **Description**: Looks up the target user's `socketId` from MongoDB and emits the specified event directly to that user's active client session.

### 2. Health Check
- **Route**: `GET /health`
- **Response**: `200 OK`
- **Description**: Lightweight endpoint for uptime monitors and preventing hosting platforms (e.g. Render / Railway) from sleeping.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js** `>= 18`
- **MongoDB Atlas** or local MongoDB instance

### Installation & Run

```bash
# 1. Navigate to socketServer directory
cd socketServer

# 2. Install dependencies
npm install

# 3. Start development server (with nodemon)
npm run dev
```

The socket server will connect to MongoDB and start listening on port `8000` (or your configured `PORT`).

---

## 🔑 Environment Variables

Create a `.env` file in the `socketServer/` root:

```env
# Port on which the socket server listens
PORT=8000

# MongoDB Connection String (must match the database used by Rydex Client)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/rydex"

# Allowed CORS Origin for Rydex Next.js Frontend
NEXT_BASE_URL="http://localhost:3000"
# In Production: NEXT_BASE_URL="https://rydex-roan.vercel.app"
```

---

## 🏛️ Architecture & Workflow

```mermaid
flowchart LR
    A[Next.js Client (Vercel)] <-->|Socket.IO Connection| B[Socket.IO Server (Render)]
    B <-->|Mongoose ODM| C[(MongoDB Database)]
    D[Next.js API Routes] -->|POST /emit| B
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Crafted with ❤️ by <b>Anmol Maurya (Amy)</b>
</p>

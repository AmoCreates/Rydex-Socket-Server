import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import dbConnection from "./config/db.js";
import User from "./models/user.mode.js";
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.NEXT_BASE_URL || "http://localhost:3000",
		method: ["GET", "POST"],
	},
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", (req, res) => {
	res.send("server is ready to serve");
});

io.on("connection", async (socket) => {
	console.log(`User Connected: ${socket.id}`);

	socket.on("identity", async (userId) => {
		socket.userId = userId;
		console.log(`user id: ${userId}`);
		await User.findByIdAndUpdate(userId, {
			socketId: socket.id,
			isOnline: true,
		});
	});

	socket.on("disconnect", async () => {
		if (!socket.userId) return;
		console.log("User Disconnected", socket.id);
		await User.findOneAndUpdate(socket.userId, {
				$unset: { socketId: 1 }, // This completely removes the socketId field
				$set: { isOnline: false },
			});
	});
});

server.listen(port, async () => {
	console.log(`server ready, listening at ${port}`);
	await dbConnection();
});

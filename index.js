import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import dbConnection from "./config/db.js";
import User from "./models/user.mode.js";
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.NEXT_BASE_URL || "http://localhost:3000",
		method: ["GET", "POST"],
	},
});

app.post("/emit", async (req, res) => {
	try {
		const { event, userId, data } = req.body;
		const user = await User.findById(userId);

		io.to(user.socketId).emit(event, data);
		return res.json({ success: true });
	} catch (error) {
		console.log(error)
		return res.json({ success: false });
	}
});

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

	socket.on("update_coordinates", async ({ userId, lon, lat }) => {
		await User.findByIdAndUpdate(userId, {
			location: {
				type: "Point",
				coordinates: [lon, lat],
			},
		});
	});

	socket.on("join-ride", (bookingId) => {
		console.log("ride joined: ", bookingId)
		socket.join(`ride-${bookingId}`)
	})

	socket.on("driver-location-update", ({bookingId, status, latitude, longitude}) => {
		io.to(`ride-${bookingId}`).emit("driver-location", {
			latitude, longitude, bStatus: status
		})
	})

	socket.on("new-message", (data) => {
		io.to(`ride-${data.bookingId}`).emit("new-message", data)
	})

	socket.on("cash-request", ({bookingId}) => {
		io.to(`ride-${bookingId}`).emit("cash-requested")
	})

	socket.on("cash-received", ({bookingId}) => {
		io.to(`ride-${bookingId}`).emit("cash-received")
	})

	socket.on("disconnect", async () => {
		if (!socket.userId) return;
		console.log("User Disconnected", socket.id);
		await User.findByIdAndUpdate(socket.userId, {
			$unset: { socketId: 1 }, // This completely removes the socketId field
			$set: { isOnline: false },
		});
	});
});


server.listen(port, async () => {
	console.log(`server ready, listening at ${port}`);
	await dbConnection();
});

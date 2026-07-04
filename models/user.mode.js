import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
		},

		isEmailVerified: {
			type: Boolean,
			default: false,
		},

		otp: {
			type: String,
			required: false,
		},

		otpExpiry: {
			type: Date,
			required: false,
		},

		password: {
			type: String,
			required: false,
		},

		mobile: {
			type: Number,
			required: false,
		},

		partnerOnBoardingStep: {
			type: Number,
			min: 0,
			max: 8,
			default: 0,
		},

		role: {
			type: String,
			default: "customer",
			enum: ["customer", "partner", "admin"],
		},

		partnerStatus: {
			type: String,
			enum: ["approved", "rejected", "pending"],
			default: "pending",
		},

		videoKycStatus: {
			type: String,
			enum: [
				"not required",
				"pending",
				"in progress",
				"approved",
				"rejected",
			],
			default: "not required",
		},

		videoKycRoomId: {
			type: String,
			default: "",
		},

		rejectionMsg: {
			type: String,
			default: "",
		},

		socketId: {
			type: String,
			default: null,
		},

		location: {
			type: {
				type: String,
				enum: ["Point"],
			},
			coordinates: [Number],
		},

		isOnline: {
			type: Boolean,
			default: false,
			index: true
		}
	},
	{ timestamps: true },
);

userSchema.index({location: "2dsphere"})

const User =  mongoose.model("User", userSchema);
export default User;

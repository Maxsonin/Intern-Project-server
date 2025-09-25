import type { FromSchema } from "json-schema-to-ts";

export const signUpSchema = {
	summary: "Sign Up user",
	tags: ["auth"],
	body: {
		type: "object",
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 6 },
			name: { type: "string", minLength: 2 },
		},
		required: ["email", "password", "name"],
	},
} as const;

export const signInSchema = {
	summary: "Sign In user",
	tags: ["auth"],
	body: {
		type: "object",
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string" },
		},
		required: ["email", "password"],
	},
} as const;

export const meSchema = {
	summary: "Get current logged-in user",
	tags: ["auth"],
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				name: { type: "string" },
				email: { type: "string", format: "email" },
			},
			required: ["id", "name", "email"],
		},
	},
} as const;

export const logoutSchema = {
	summary: "Logout user",
	tags: ["auth"],
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
			},
			required: ["success"],
		},
	},
} as const;

export type SignUpSchema = FromSchema<typeof signUpSchema.body>;
export type SignInSchema = FromSchema<typeof signInSchema.body>;
export type MeSchema = FromSchema<(typeof meSchema.response)[200]>;
export type LogoutSchema = FromSchema<(typeof logoutSchema.response)[200]>;

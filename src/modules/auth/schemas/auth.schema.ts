import type { FromSchema } from "json-schema-to-ts";

export const signUpSchema = {
	summary: "Sign Up user",
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
	body: {
		type: "object",
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string" },
		},
		required: ["email", "password"],
	},
} as const;

export type SignUpSchema = FromSchema<typeof signUpSchema.body>;
export type SignInSchema = FromSchema<typeof signInSchema.body>;

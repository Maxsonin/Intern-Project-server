export const lineItemPageSchema = {
	tags: ["lineItem"],
	description: "Serve HTML form for creation of a line item",
	security: [{ sessionCookie: [] }],
};

export const lineItemCreateSchema = {
	tags: ["lineItem"],
	description:
		"Handle form submission for creating a line item with file upload",
	consumes: ["multipart/form-data"],
	security: [{ sessionCookie: [] }],
};

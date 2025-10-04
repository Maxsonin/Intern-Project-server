export const lineItemPageSchema = {
	tags: ["lineItem"],
	description: "Serve HTML form for creation of a line item",
	security: [{ sessionCookie: [] }],
	response: {
		200: {
			description: "HTML form for creating a line item",
			content: {
				"text/html": {
					schema: {
						type: "string",
						example:
							"<!DOCTYPE html><html><body><h1>Line Item Form</h1></body></html>",
					},
				},
			},
		},
	},
};

export const lineItemCreateSchema = {
	tags: ["lineItem"],
	description:
		"Handle form submission for creating a line item with file upload",
	consumes: ["multipart/form-data"],
	security: [{ sessionCookie: [] }],
	response: {
		200: {
			description: "Returns saved line item",
			type: "object",
			properties: {
				id: { type: "string" },
				size: { type: "string" },
				min_cpm: { type: "number" },
				max_cpm: { type: "number" },
				geo: { type: "string" },
				adType: { type: "string" },
				frequency: { type: "number" },
				fileName: { type: "string" },
				createdAt: { type: "string", format: "date-time" },
			},
		},
	},
};

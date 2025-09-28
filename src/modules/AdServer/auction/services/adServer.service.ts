import type { FastifyInstance } from "fastify";

export async function getAd(
	fastify: FastifyInstance,
	args: { bidId: string; sizes: [number, number][]; leskoid: string },
) {
	const { bidId, sizes } = args;

	console.log("Fetching ad for sizes:", sizes);

	const requestedSizes = sizes.map(([w, h]) => `${w}x${h}`);
	const matchingAds = await fastify.prisma.lineItem.findMany({
		where: { size: { in: requestedSizes } },
	});
	if (!matchingAds.length) return null;
	const ad = matchingAds[Math.floor(Math.random() * matchingAds.length)];

	console.log("Matching ads:", matchingAds);
	console.log("Selected ad:", ad);

	const adUrl = `/ad/${ad.fileName}`;

	const cpm = +(Math.random() * (ad.max_cpm - ad.min_cpm) + ad.min_cpm).toFixed(
		2,
	);

	const [width, height] = ad.size.split("x").map(Number);

	const adHtml = `
    <img src="https://intern-project-server-production.up.railway.app/${adUrl}" width="${width}" height="${height}" />
  `;

	return {
		requestId: bidId,
		cpm,
		currency: "USD",
		width,
		height,
		creativeId: ad.id,
		ad: adHtml,
		ttl: 300,
		netRevenue: true,
		mediaType: "banner" as const,
	};
}

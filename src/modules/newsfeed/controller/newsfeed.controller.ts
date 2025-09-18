import { FastifyRequest, FastifyReply } from 'fastify';
import { parseFeed } from '../services/newsfeed.service';

export async function getNewsfeedHandler(request: FastifyRequest<{ Querystring: { url?: string; force?: boolean } }>, reply: FastifyReply) {
  const url = request.query.url || request.server.config.DEFAULT_FEED_URL;
  const force = request.query.force || false;

  let feedData;
  if (force) {
    feedData = await parseFeed(url);
  } else {
    // TODO: check DB first
    const cachedData = null;
    if (cachedData) {
      feedData = cachedData;
    } else {
      feedData = await parseFeed(url);
      // TODO: save to DB
    }
  }

  reply.code(200).send({ data: feedData });
}

import { FastifyInstance } from 'fastify';
import { getNewsfeedSchema } from '../schemas/getNewsfeed.schema';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import { getNewsfeedHandler } from '../controller/newsfeed.controller';

export async function getFeedDataRoutes(fastify: FastifyInstance) {
  const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

 route.get('/newsfeed', { schema: getNewsfeedSchema }, getNewsfeedHandler);
}

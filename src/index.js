const { GraphQLServer } = require('graphql-yoga');
const { PrismaClient } = require('@prisma/client');

const { schema } = require('./schema');

const prisma = new PrismaClient();

new GraphQLServer({
  schema,
  context: { prisma }
}).start(() => console.log('Server ready at: http://localhost:4000'));

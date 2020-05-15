const { makeSchema, objectType, stringArg, intArg } = require('nexus');
const { nexusPrismaPlugin } = require('nexus-prisma');

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.post()

    t.list.field('feed', {
      type: 'Post',
      resolve: (_parent, _args, ctx) => {
        return ctx.prisma.post.findMany({
          where: { published: true }
        })
      }
    });

    t.list.field('filterPosts', {
      type: 'Post',
      args: {
        searchString: stringArg({ nullable: true })
      },
      resolve: (_parent, { searchString }, ctx) => {
        return ctx.prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: searchString } },
              { content: { contains: searchString } }
            ]
          }
        })
      }
    })
  }
});

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.crud.createOneUser({ alias: 'signupUser' })
    t.crud.deleteOnePost()

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg({ nullable: true }),
        authorEmail: stringArg()
      },
      resolve: (_parent, { title, content, authorEmail }, ctx) => {
        return ctx.prisma.post.create({
          data: { title, content,
            published: false,
            author: { connect: { email: authorEmail } }
          }
        })
      }
    });

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: {
        id: intArg()
      },
      resolve: (_parent, { id }, ctx) => {
        return ctx.prisma.post.update({
          where: { id: Number(id) },
          data: { published: true }
        });
      }
    });
  }
});

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.name()
    t.model.posts({
      pagination: false
    })
  }
});

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.content()
    t.model.published()
    t.model.author()
  }
});

const schema = makeSchema({
  types: [Query, Mutation, User, Post],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts'
  }
});

module.exports = {
  schema
};

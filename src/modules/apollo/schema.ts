import { makeExecutableSchema, addMockFunctionsToSchema, mergeSchemas } from 'graphql-tools';

import resolvers from './resolvers';

const typeDefs = `
  # the schema allows the following query:
  type Query {
    posts: [Post]
    authors: [Author]
    post(id: Int!): Post
    author(id: Int!): Author
  }

  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }
`;

const logger = { log: (e) => console.log(e) };

const schema = makeExecutableSchema({ typeDefs, resolvers, logger });

export default schema;

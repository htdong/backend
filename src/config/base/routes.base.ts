console.log('...Loading [Routes]');

// External
import express = require("express");

const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
// import { Engine } from 'apollo-engine';
// const ENGINE_API_KEY = 'gkbps-6868:lNNG0Ux7oOnE33aL2UnSSw';
// const { makeExecutableSchema } = require('graphql-tools');
// import { find, filter } from 'lodash';
import schema from '../../modules/apollo/schema';

// Internal
var NotificationsRoutes = require('../../modules/notification/notifications.route');
var MessagesRoutes = require('../../modules/message/messages.route');
var UsersRoutes = require('../../modules/users/users.route');
var GkClientsRoutes = require('../../modules/gkClients/gkClients.route');
var SessionRoutes = require('../../modules/session/session.route');
var GkRequestsRoutes = require('../../modules/gkRequests/gkRequests.route');
var ChatRoutes = require('../../modules/chat/chat.route');
var RequestApproval = require('../../modules/requestApproval/requestApproval.route');
var RequestFile = require('../../modules/requestFiles/requestFiles.route');

var DashboardRoutes = require('../../modules/dashboard/dashboard.route');

var app = express();
var path = require('path');
var serveStatic = require('serve-static');

class RoutesBase {

  get routes() {
    // API restful introduction
    let router = express.Router();
    router.get('/', (req, res, next) => {
      res.json({
        message: 'Hello World. I am the API Restful server for GKSBS!'
      });
    });
    app.use('/', router);

    // API restful services
    app.use("/notifications", NotificationsRoutes);
    app.use("/messages", MessagesRoutes);
    app.use("/users", UsersRoutes);
    app.use("/gkClients", GkClientsRoutes);
    app.use("/gkRequests", GkRequestsRoutes);
    app.use("/settings", SessionRoutes)
    app.use("/chat", ChatRoutes);
    app.use("/requestApproval", RequestApproval);
    app.use("/requestFiles", RequestFile);

    // Common
    app.use("/dashboard", DashboardRoutes);

    // Static files
    app.use(serveStatic(path.join('/Users/donghoang/node/gk')));

    // // APOLLO GRAPHQL
    // // Some fake data
    // const authors = [
    //   { id: 1, firstName: 'Tom', lastName: 'Coleman' },
    //   { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
    //   { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
    // ];
    //
    // const posts = [
    //   { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
    //   { id: 2, authorId: 2, title: 'Welcome to Apollo', votes: 3 },
    //   { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
    //   { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
    // ];
    //
    // // The GraphQL schema in string form
    // const typeDefs = `
    //   # the schema allows the following query:
    //   type Query {
    //     posts: [Post]
    //     post(id: Int!): Post
    //     author(id: Int!): Author
    //   }
    //
    //   type Author {
    //     id: Int!
    //     firstName: String
    //     lastName: String
    //     posts: [Post] # the list of Posts by this author
    //   }
    //
    //   type Post {
    //     id: Int!
    //     title: String
    //     author: Author
    //     votes: Int
    //   }
    //
    //   # this schema allows the following mutation:
    //   type Mutation {
    //     upvotePost (
    //       postId: Int!
    //     ): Post
    //   }
    // `;
    //
    // // The resolvers
    // const resolvers = {
    //   Query: {
    //     posts: () => posts,
    //     post: (_, { id }) => find(posts, { id: id }),
    //     author: (_, { id }) => find(authors, { id: id }),
    //   },
    //   Mutation: {
    //     upvotePost: (_, { postId }) => {
    //       const post = find(posts, { id: postId });
    //       if (!post) {
    //         throw new Error(`Couldn't find post with id ${postId}`);
    //       }
    //       post.votes += 1;
    //       return post;
    //     },
    //   },
    //   Author: {
    //     posts: (author) => filter(posts, { authorId: author.id }),
    //   },
    //   Post: {
    //     author: (post) => find(authors, { id: post.authorId }),
    //   },
    // };
    //
    // // Put together a schema
    // const logger = { log: (e) => console.log(e) };
    // const schema = makeExecutableSchema({
    //   typeDefs,
    //   resolvers,
    //   logger
    // });

    // The GraphQL endpoint
    app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

    // GraphiQL, a visual editor for queries
    app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

    return app;
  }
}

export = RoutesBase;

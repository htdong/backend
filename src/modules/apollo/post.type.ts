const Post = `
  type Post {
    id: Int!
    title: String
    votes: Int
    author: Author
  }

  type Query {
    posts: [Post]
    post(id: Int!): Post
  }

  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }
`;

export default Post;

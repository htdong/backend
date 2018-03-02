import Post from './post.type';

const Author = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }

  type Query {
    authors: [Author]
    author(id: Int!): Author
  }
`;

export default [Author, Post];

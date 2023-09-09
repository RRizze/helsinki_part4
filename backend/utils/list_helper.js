const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => {
    return acc += blog.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  let favorite = blogs[0];

  for (let i = 1; i < blogs.length; ++i) {
    if (favorite.likes < blogs[i].likes) {
      favorite = blogs[i];
    }
  }

  return favorite;
};

const mostBlogs = (blogs) => {
  const authors = {};

  for (const blog of blogs) {
    if (authors.hasOwnProperty(blog.author)) {
      authors[blog.author] += 1;
    } else {
      authors[blog.author] = 1;
    }
  }
  const maxBlogs = Math.max(...Object.values(authors));
  let res;

  for (const author in authors) {
    if (authors[author] === maxBlogs) {
      res = {
        author,
        blogs: maxBlogs,
      };
    }
  }
  return res;
};

const mostLikes = (blogs) => {
  const authors = {};

  for (const blog of blogs) {
    if (authors.hasOwnProperty(blog.author)) {
      authors[blog.author] += blog.likes;
    } else {
      authors[blog.author] = blog.likes;
    }
  }

  const maxLikes = Math.max(...Object.values(authors));
  let res;
  for (const author in authors) {
    if (authors[author] === maxLikes) {
      res = {
        author,
        likes: maxLikes,
      };
    }
  }

  return res;
};

module.exports = { 
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};

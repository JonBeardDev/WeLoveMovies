const knex = require("../db/connection");
const reduceProperties = require("../utils/reduce-properties");

// Nest critic information as an object within returned object
const addCritic = reduceProperties("review_id", {
  preferred_name: ["critic", "preferred_name"],
  surname: ["critic", "surname"],
  organization_name: ["critic", "organization_name"],
});

// Return all movies (limit information to selected columns)
async function list() {
  return knex("movies").select(
    "movie_id as id",
    "title",
    "runtime_in_minutes",
    "rating",
    "description",
    "image_url"
  );
}

// Return each movie one time only if the "is_showing" field in the movies_theaters table is true for at least one theater
async function listIsShowing() {
  return knex("movies as m")
    .join("movies_theaters as mt", "m.movie_id", "mt.movie_id")
    .select(
      "m.movie_id as id",
      "m.title",
      "m.runtime_in_minutes",
      "m.rating",
      "m.description",
      "m.image_url"
    )
    .where("mt.is_showing", true)
    .distinct();
}

// Return all columns for the given movie ID
async function read(movieId) {
  return knex("movies").select("*").where({ movie_id: movieId }).first();
}

// For the given movie ID, return all theaters that are showing it (is_showing field in movies_theaters is true)
async function listTheaters(movieId) {
  return knex("theaters as t")
    .join("movies_theaters as mt", "t.theater_id", "mt.theater_id")
    .select("t.*", "mt.is_showing", "mt.movie_id")
    .where("mt.is_showing", true)
    .andWhere("mt.movie_id", movieId);
}

// For the given movie ID, return all reviews with critic name and organization as a nested object within the review details
async function listReviews(movieId) {
  return knex("reviews as r")
    .join("critics as c", "r.critic_id", "c.critic_id")
    .select("r.*", "c.*")
    .where("r.movie_id", movieId)
    .then(addCritic);
}

module.exports = {
  list,
  listIsShowing,
  read,
  listTheaters,
  listReviews,
};

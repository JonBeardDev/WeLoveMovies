const knex = require("../db/connection");
const reduceProperties = require("../utils/reduce-properties");

// Nest critic information as an object within returned object
const addCritic = reduceProperties("review_id", {
  preferred_name: ["critic", "preferred_name"],
  surname: ["critic", "surname"],
  organization_name: ["critic", "organization_name"],
});

// return all columnes for given review ID
function read(reviewId) {
  return knex("reviews").select("*").where({ review_id: reviewId }).first();
}

// Delete row for given review ID
function destroy(reviewId) {
  return knex("reviews").where({ review_id: reviewId }).del();
}

// Update review for given review ID. Function is async to account for needing to separate update and return code
async function update(updatedReview) {
  // Update all fields for the given review ID with the updatedReview from req.body
  await knex("reviews")
    .select("*")
    .where({ review_id: updatedReview.review_id })
    .update(updatedReview);

  // Return all columns from both reviews and critics table with critic information as nested object
  return knex("reviews as r")
    .join("critics as c", "r.critic_id", "c.critic_id")
    .select("r.*", "c.*")
    .where({ "r.review_id": updatedReview.review_id })
    .then(addCritic);
}

module.exports = {
  read,
  delete: destroy,
  update,
};

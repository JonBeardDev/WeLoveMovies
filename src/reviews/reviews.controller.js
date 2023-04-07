const service = require("./reviews.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Confirm review exists by checking review ID in parameters against reviews table in database
async function reviewExists(req, res, next) {
  const { reviewId } = req.params;
  const review = await service.read(reviewId);
  if (review) {
    res.locals.review = review;
    return next();
  }
  return next({ status: 404, message: `Review cannot be found.` });
}

// Delete confirmed existing review and return 204 status with no message content
async function destroy(req, res) {
  await service.delete(res.locals.review.review_id);
  res.sendStatus(204);
}

// Update confirmed existing review and return updated review (with critic information)
async function update(req, res) {
  const updatedReview = {
    ...req.body.data,
    review_id: res.locals.review.review_id,
  };

  const [ data ] = await service.update(updatedReview);
  res.json({ data });
}

module.exports = {
  delete: [asyncErrorBoundary(reviewExists), asyncErrorBoundary(destroy)],
  update: [asyncErrorBoundary(reviewExists), asyncErrorBoundary(update)],
};

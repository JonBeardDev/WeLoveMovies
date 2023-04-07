const service = require("./movies.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Confirm movie exists by checking movie ID in paramaters against movies table in database
async function movieExists(req, res, next) {
  const { movieId } = req.params;

  const movie = await service.read(movieId);
  if (movie) {
    res.locals.movie = movie;
    return next();
  }
  return next({ status: 404, message: "Movie cannot be found" });
}

// List all movies OR all movies that are showing (if queried)
async function list(req, res) {
  let data;
  // If request includes ?is_showing=true return ONLY those movies that are showing at least one theater
  if (req.query.is_showing) {
    data = await service.listIsShowing();
  } 
  // If query is not included (or is false), return ALL movies
  else {
    data = await service.list();
  }
  res.json({ data });
}

// Return confirmed existing movie matching the given movie ID
function read(req, res) {
  const data = res.locals.movie;
  res.json({ data });
}

// Return all theaters showing the confirmed existing movie
async function listTheaters(req, res) {
  const data = await service.listTheaters(res.locals.movie.movie_id);
  res.json({ data });
}

// Return all reviews for the confirmed existing movie
async function listReviews(req, res) {
  const data = await service.listReviews(res.locals.movie.movie_id);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(movieExists), read],
  listTheaters: [
    asyncErrorBoundary(movieExists),
    asyncErrorBoundary(listTheaters),
  ],
  listReviews: [
    asyncErrorBoundary(movieExists),
    asyncErrorBoundary(listReviews),
  ],
};

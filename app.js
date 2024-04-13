const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

/// Initializing the database and server i.e., connected using NODE JS

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Converting Movie database object to response object

const convertMovieDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// Converting Director database to Response Object

const convertDirectorDBObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API 1 Returns a list of all movie names in the movie table using GET Method

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await db.all(getMovieQuery);
  response.send(
    moviesArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

// API 2 Creates a new movie in the movie table using POST Method

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    (${directorId},'${movieName}', '${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 Returns a movie based on the movie ID using GET Method

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDBObjectToResponseObject(movie));
});

// API 4 Updates the details of a movie in the movie table based on the movie ID using PUT Method

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE
    movie
  SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5 Deletes a movie from the movie table based on the movie ID using DELETE Method

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6 Returns a list of all directors in the director table using GET Method

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
  SELECT
    *
  FROM
    director;`;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorDBObjectToResponseObject(eachDirector)
    )
  );
});

// API 7 Returns a list of all movie names directed by a specific director using GET Method

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
  SELECT
    movie_name
  FROM
    movie
  WHERE
    director_id = '${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;

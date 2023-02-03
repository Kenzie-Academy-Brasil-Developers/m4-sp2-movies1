import express, { Application } from "express";
import { startDatabase } from "./database";
import {
  createMovie,
  createMovieFormat,
  deleteMovieById,
  listMovie,
  listMoviesById,
  updateMovie,
  updatePartial,
} from "./functions";
import { ensureListExist } from "./middlewares";

const app: Application = express();
app.use(express.json());

app.post("/movies", createMovie);
app.post("/movies-format", createMovieFormat);
app.get("/movies", listMovie);
app.get("/movies/:id", ensureListExist, listMoviesById);
app.delete("/movies/:id", ensureListExist, deleteMovieById);
app.put("/movies/:id", ensureListExist, updateMovie);
app.patch("/movies/:id", updatePartial);

app.listen(3000, async () => {
  await startDatabase();
  console.log("server is running");
});

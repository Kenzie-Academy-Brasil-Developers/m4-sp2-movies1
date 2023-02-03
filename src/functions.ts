import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import { IListMovies, IPage, moviesCreate, moviesResult } from "./interfaces";

export const validateDataMovie = (payload: any): IListMovies => {
  if (typeof payload.name !== "string") {
    throw new Error("Name not String");
  }
  if (typeof payload.duration !== "number") {
    throw new Error("Duration is not a number");
  }
  if (typeof payload.price !== "number") {
    throw new Error("Price is not a number");
  }
  if (typeof payload.description === "number") {
    throw new Error("The movie description need to be a string or null");
  }

  return payload;
};

export const createMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const moviesDataRequest: IListMovies = request.body;
    const moviesData: moviesCreate = {
      ...moviesDataRequest,
    };

    const queryString: string = `
    INSERT INTO
      movie( name, description, duration, price )
    VALUES
      ($1, $2, $3, $4)
      RETURNING*;
  `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: Object.values(moviesData),
    };

    const queryResult: moviesResult = await client.query(queryConfig);

    return response.status(201).json(queryResult.rows);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(409).json({
        message: error.message,
      });
    }
    console.log(error);
    return response.status(500).json({ message: "internal server error" });
  }
};

export const createMovieFormat = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const moviesDataRequest: IListMovies = validateDataMovie(request.body);
    const moviesData: moviesCreate = {
      ...moviesDataRequest,
    };

    const queryString: string = format(
      `
    INSERT INTO
      movie(%I )
    VALUES
      (%L)
      RETURNING*;
  `,
      Object.keys(moviesData),
      Object.values(moviesData)
    );

    const queryResult: moviesResult = await client.query(queryString);
    return response.status(201).json();
  } catch (error) {
    if (error instanceof Error) {
      return response.status(409).json({
        message: error.message,
      });
    }
    console.log(error);
    return response.status(500).json({ message: "internal server error" });
  }
};

export const listMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const perPage: any =
    request.query.perPage === undefined ? 5 : request.query.perPage;
  let page: any = Number(request.query.page) > 0 ? request.query.page : 1;
  const prevPage = +page - 1;
  const nextPage = +page + 1;

  page = (page - 1) * perPage;

  const query: string = `
    SELECT
         *
    FROM
      movie
    LIMIT $1 OFFSET $2;
    `;

  const queryConfig: QueryConfig = {
    text: query,
    values: [perPage, page],
  };

  const queryResult: moviesResult = await client.query(queryConfig);

  const pages: IPage = {
    prevPage:
      prevPage === 0
        ? null
        : `http://localhost:3000/movies?page=${prevPage}&perPage=5`,
    nextPage:
      queryResult.rowCount === 0
        ? null
        : `http://localhost:3000/movies?page=${nextPage}&perPage=5`,
    count: Number(queryResult.rowCount),
    data: queryResult.rows,
  };
  if (!queryResult.rows[0]) {
    return response.status(404).json({
      message: "No Film Registered!",
    });
  }

  return response.status(200).json(pages);
};

export const listMoviesById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT 
        *
    FROM
      movie
    WHERE
      id = $1; 
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: moviesResult = await client.query(queryConfig);

  return response.json(queryResult.rows[0]);
};

export const deleteMovieById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
    DELETE FROM
        movie
    WHERE
      id = $1; 
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};

export const updateMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);
  const moviesData = Object.values(request.body);

  const queryString: string = `
    UPDATE
        movie
    SET
      name = $1, 
      description = $2, 
      duration = $3, 
      price = $4
    WHERE
      id = $5
    RETURNING *;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [...moviesData, id],
  };

  const queryResult: moviesResult = await client.query(queryConfig);

  return response.json(queryResult.rows[0]);
};

export const updatePartial = async (
  request: Request,
  response: Response
): Promise<Response> => {
  if (request.body.id) {
    return response.status(400).json({
      message: "Erro updating id!",
    });
  }
  if (request.body.name) {
    return response.status(409).json({
      message: "Erro name is unique",
    });
  }

  const id: number = parseInt(request.params.id);
  const movieData = Object.values(request.body);
  const listKeys = Object.keys(request.body);

  const queryString: string = format(
    `
      UPDATE
          movie
      SET(%I) = ROW(%L)  
      WHERE 
          id = $1
      RETURNING *;      
  `,
    listKeys,
    movieData
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: moviesResult = await client.query(queryConfig);
  return response.json(queryResult.rows[1]);
};

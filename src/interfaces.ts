import { QueryResult } from "pg";

export interface IListMovies {
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

export interface IIdmovie extends IListMovies {
  id: number;
}

export interface IPage {
  prevPage: string | null;
  nextPage: string | null;
  count: number;
  data: IListMovies[];
}
export type requiredKeys = "name" | "description" | "duration" | "price";

export type moviesResult = QueryResult<IListMovies>;
export type moviesCreate = Omit<IIdmovie, "id">;

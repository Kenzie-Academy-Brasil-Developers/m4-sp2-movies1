import { Client } from "pg";

export const client = new Client({
  user: "Natha",
  password: "123456Aa",
  host: "localhost",
  database: "Movie",
  port: 5432,
});

export const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("database connect!");
};

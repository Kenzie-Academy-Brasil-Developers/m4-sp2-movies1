CREATE TABLE IF NOT EXISTS movie(
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(50) UNIQUE NOT NULL,
 description TEXT,
 duration INTEGER NOT NULL,
 price INTEGER NOT NULL
);

INSERT INTO
movie( name, description, duration, price )
VALUES
('M3GAN', ' uma boneca assassina (e dançarina) chamada M3GAN',87,19);


SELECT
 *
FROM
 movie;
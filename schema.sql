
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    rating INTEGER
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    black_id INTEGER REFERENCES users,
    white_id INTEGER REFERENCES users,
    winner_id INTEGER REFERENCES users,
    date TIMESTAMP,
    move_count INTEGER
);

CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games,
    white_bitboard BIGINT,
    black_bitboard BIGINT,
    prev_position INTEGER REFERENCES positions
);

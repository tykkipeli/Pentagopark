
CREATE TABLE testusers (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    rating REAL
);

CREATE TABLE testgames (
    id SERIAL PRIMARY KEY,
    black_id INTEGER REFERENCES testusers,
    white_id INTEGER REFERENCES testusers,
    winner_id INTEGER REFERENCES testusers,
    date TIMESTAMP,
    move_count INTEGER
);

CREATE TABLE testpositions (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES testgames,
    white_bitboard BIGINT,
    black_bitboard BIGINT,
    prev_position INTEGER REFERENCES testpositions
);

CREATE INDEX idxtest_bitboard ON testpositions (white_bitboard,black_bitboard);
CREATE INDEX idxtest_prevpos ON testpositions (prev_position);



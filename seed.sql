CREATE DATABASE "sb-ex-db";

\c "sb-ex-db";

CREATE TABLE requests (
  id UUID PRIMARY KEY,
  time TIMESTAMP NOT NULL DEFAULT NOW(),
  filter VARCHAR(10) NOT NULL
);
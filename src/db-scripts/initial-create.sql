
-- Target PostgreSQL

-- TODO: (db) users
-- TODO: roles

-- **************** TABLES ****************

-- Table: users

CREATE TABLE users
(
  id uuid NOT NULL,
  sub character varying(255) NOT NULL, -- Authentication system (external) unique id for the user.
  nickname character varying(32) NOT NULL, -- User choosen nickname. It is displayed in the application to the other users.
  created_on timestamp without time zone NOT NULL,
  updated_on timestamp without time zone NOT NULL,
  CONSTRAINT pk_users PRIMARY KEY (id ),
  CONSTRAINT u_users_sub UNIQUE (sub )
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO parcour;
GRANT ALL ON TABLE users TO parcour;
GRANT ALL ON TABLE users TO parcour_rw;
COMMENT ON COLUMN users.sub IS 'Authentication system (external) unique id for the user.';
COMMENT ON COLUMN users.nickname IS 'User choosen nickname. It is displayed in the application to the other users.';

-- Table: parcours

CREATE TABLE parcours
(
  id uuid NOT NULL,
  name character varying(255),
  data text,
  created_on timestamp without time zone NOT NULL,
  updated_on timestamp without time zone NOT NULL,
  user_id uuid NOT NULL, -- Owner user id
  CONSTRAINT pk_parcour PRIMARY KEY (id ),
  CONSTRAINT fk_parcour_user FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE parcours
  OWNER TO parcour;
GRANT ALL ON TABLE parcours TO parcour;
GRANT SELECT, UPDATE, INSERT, DELETE, REFERENCES ON TABLE parcours TO parcour_rw;
COMMENT ON COLUMN parcours.user_id IS 'Owner user id';

-- Table: runs

CREATE TABLE runs
(
  id uuid NOT NULL,
  parcour_id uuid NOT NULL,
  user_id uuid,
  created_on timestamp without time zone,
  updated_on timestamp without time zone,
  started_on timestamp without time zone,
  ended_on timestamp without time zone,
  outcome integer,
  CONSTRAINT pk_runs PRIMARY KEY (id ),
  CONSTRAINT fk_run_parcour FOREIGN KEY (parcour_id)
      REFERENCES parcours (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT fk_run_user FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE runs
  OWNER TO parcour;
GRANT ALL ON TABLE runs TO parcour;
GRANT SELECT, UPDATE, INSERT, DELETE, REFERENCES ON TABLE runs TO parcour_rw;

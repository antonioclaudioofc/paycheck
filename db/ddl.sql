-- paycheck_db.public.users definition

-- Drop table

-- DROP TABLE paycheck_db.public.users;

CREATE TABLE paycheck_db.public.users (
	id text NOT NULL,
	"name" text,
	email text NOT NULL,
	email_verified timestamp,
	image text,
	password_hash text,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp NOT NULL,
	active bool DEFAULT true NOT NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX users_email_key ON paycheck_db.public.users (email);


-- paycheck_db.public.accounts definition

-- Drop table

-- DROP TABLE paycheck_db.public.accounts;

CREATE TABLE paycheck_db.public.accounts (
	id text NOT NULL,
	user_id text NOT NULL,
	"type" text NOT NULL,
	provider text NOT NULL,
	provider_account_id text NOT NULL,
	refresh_token text,
	access_token text,
	expires_at int4,
	token_type text,
	"scope" text,
	id_token text,
	session_state text,
	CONSTRAINT accounts_pkey PRIMARY KEY (id),
	CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES paycheck_db.public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON paycheck_db.public.accounts (provider,provider_account_id);


-- paycheck_db.public.categories definition

-- Drop table

-- DROP TABLE paycheck_db.public.categories;

CREATE TABLE paycheck_db.public.categories (
	id text NOT NULL,
	user_id text NOT NULL,
	"name" text NOT NULL,
	color text DEFAULT '#6366f1'::text NOT NULL,
	icon text,
	"type" TransactionType NOT NULL,
	is_default bool DEFAULT false NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	active bool DEFAULT true NOT NULL,
	updated_at timestamp NOT NULL,
	CONSTRAINT categories_pkey PRIMARY KEY (id),
	CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES paycheck_db.public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX categories_user_id_name_type_key ON paycheck_db.public.categories (user_id,"name","type");


-- paycheck_db.public.goals definition

-- Drop table

-- DROP TABLE paycheck_db.public.goals;

CREATE TABLE paycheck_db.public.goals (
	id text NOT NULL,
	user_id text NOT NULL,
	title text NOT NULL,
	target_amount numeric(12,2) NOT NULL,
	saved_amount numeric(12,2) DEFAULT 0 NOT NULL,
	deadline timestamp,
	status GoalStatus DEFAULT 'ACTIVE'::"GoalStatus" NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp NOT NULL,
	active bool DEFAULT true NOT NULL,
	CONSTRAINT goals_pkey PRIMARY KEY (id),
	CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES paycheck_db.public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- paycheck_db.public.sessions definition

-- Drop table

-- DROP TABLE paycheck_db.public.sessions;

CREATE TABLE paycheck_db.public.sessions (
	id text NOT NULL,
	session_token text NOT NULL,
	user_id text NOT NULL,
	expires timestamp NOT NULL,
	CONSTRAINT sessions_pkey PRIMARY KEY (id),
	CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES paycheck_db.public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX sessions_session_token_key ON paycheck_db.public.sessions (session_token);


-- paycheck_db.public.transactions definition

-- Drop table

-- DROP TABLE paycheck_db.public.transactions;

CREATE TABLE paycheck_db.public.transactions (
	id text NOT NULL,
	user_id text NOT NULL,
	category_id text NOT NULL,
	amount numeric(12,2) NOT NULL,
	"type" TransactionType NOT NULL,
	description text NOT NULL,
	"date" timestamp NOT NULL,
	tags _text DEFAULT ARRAY[]::text[],
	is_recurring bool DEFAULT false NOT NULL,
	recurrence Recurrence,
	notes text,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp NOT NULL,
	active bool DEFAULT true NOT NULL,
	CONSTRAINT transactions_pkey PRIMARY KEY (id),
	CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES paycheck_db.public.categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES paycheck_db.public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX transactions_user_id_category_id_idx ON paycheck_db.public.transactions (user_id,category_id);
CREATE INDEX transactions_user_id_date_idx ON paycheck_db.public.transactions (user_id,"date");
CREATE INDEX transactions_user_id_type_idx ON paycheck_db.public.transactions (user_id,"type");


-- paycheck_db.public.budgets definition

-- Drop table

-- DROP TABLE paycheck_db.public.budgets;

CREATE TABLE paycheck_db.public.budgets (
	id text NOT NULL,
	user_id text NOT NULL,
	category_id text NOT NULL,
	amount numeric(12,2) NOT NULL,
	"month" int4 NOT NULL,
	"year" int4 NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp NOT NULL,
	active bool DEFAULT true NOT NULL,
	CONSTRAINT budgets_pkey PRIMARY KEY (id),
	CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES paycheck_db.public.categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES paycheck_db.public.users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX budgets_user_id_category_id_month_year_key ON paycheck_db.public.budgets (user_id,category_id,"month","year");
# Define a variable that will hold the arguments passed from the command line
ARGS :=

migrate-add:
	bunx knex migrate:make $(ARGS) --knexfile ./knex/knexfile.ts -x ts

migrate-run:
	bun --env-file .env.local knex migrate:latest --knexfile ./knex/knexfile.ts

migrate-rollback:
	bun --env-file .env.local knex migrate:rollback --knexfile ./knex/knexfile.ts

migrate-rollback-all:
	bun --env-file .env.local knex migrate:rollback --all --knexfile ./knex/knexfile.ts

migrate-run-test:
	bun --env-file .env.test knex migrate:latest --knexfile ./knex/knexfile.ts --env test

migrate-rollback-test:
	bun --env-file .env.test knex migrate:rollback --knexfile ./knex/knexfile.ts --env test

migrate-rollback-all-test:
	bun --env-file .env.test knex migrate:rollback --all --knexfile ./knex/knexfile.ts --env test

.PHONY: dev build test

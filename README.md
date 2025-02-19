# personal-chat

AI chat app meant to be run locally.
Built with SvelteKit, TypeScript, Drizzle, SQLite, and OpenRouter.

## Quick start

```bash
yarn install
yarn secrets
yarn db:push
yarn dev
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
yarn dev

# or start the server and open the app in a new browser tab
yarn dev -- --open
```

## Building

To create a production version of your app:

```bash
yarn build
```

You can preview the production build with `yarn preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Secrets

Environment variables are defined in `template.env`.
Taking a look inside, you will see that the OpenRouter API key is a reference to a 1Password secret, which requires the `op` CLI utility to fill in and replace with the real secret.

This can be managed with the following commands:

```bash
# fill in secrets to .env
yarn secrets

# delete .env file
yarn clean:secrets
```

## Database

The database is defined in `src/lib/db/schema.ts`.
It is using Drizzle for SQLite.

```bash
yarn db:push

yarn db:migrate # safer option

yarn db:studio # to view the database
```


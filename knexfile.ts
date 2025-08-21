import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'wb',
      password: process.env.POSTGRES_PASSWORD || 'wb',
      database: process.env.POSTGRES_DB || 'wb',
    },
    migrations: {
      directory: './dist/migrations',
      extension: 'js',
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './dist/migrations',
      extension: 'js',
    },
  },
};

export default config;

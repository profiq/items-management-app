export type DatabaseConfigType = {
  type: 'sqlite' | 'mariadb';
  database: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
};

export default () => ({
  port: parseInt(process.env.PORT || '') || 3000,
  google: {
    project_id:
      process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    storage_bucket: process.env.GOOGLE_STORAGE_BUCKET,
  },
  database: {
    type: process.env.NODE_ENV == 'production' ? 'mariadb' : 'sqlite',
    database:
      process.env.NODE_ENV == 'production'
        ? process.env.DB_DATABASE
        : 'src/db/database.db',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '') || undefined,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});

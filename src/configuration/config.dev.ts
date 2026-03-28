export const configDev = () => ({
  environment: 'development',
  MONGO_URI: process.env.MONGO_URI,
});

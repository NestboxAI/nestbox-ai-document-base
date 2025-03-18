import { config } from 'dotenv';
config();

const AppConfig = {
  APP: {
    NAME: process.env.APP_NAME,
    VERSION: process.env.APP_VERSION,
    PORT: Number(process.env.APP_PORT),
    API_KEY: process.env.APP_API_KEY,
  },
};

export default AppConfig;

import { config } from 'dotenv'
config();

const AppConfig = {
    APP: {
        PORT: Number(process.env.APP_PORT),
        API_KEY: process.env.APP_API_KEY,
    },
};

export default AppConfig;

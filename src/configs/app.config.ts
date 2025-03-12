import { config } from 'dotenv'
config();

const AppConfig = {
    APP: {
        PORT: Number(process.env.APP_PORT),
    },
};

export default AppConfig;

import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  return cleanEnv(process.env, {
    PORT: port({ default: 4567 }),
    LOGS_PATH: str(),
    DATABASE_URL: str(),
    SESSION_SECRET: str()
  });
};

export default validateEnv;
import { defineConfig } from 'orval';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.ENV_FILE || '.env.local';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export default defineConfig({
  myrecipebook: {
    input: `${process.env.NEXT_PUBLIC_API_URL}/swagger/v1/swagger.json`,
    output: {
      mode: 'split',
      target: 'src/api/generated',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customInstance',
        }
      },
    },
  },
});
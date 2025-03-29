import { defineConfig } from 'orval';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

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
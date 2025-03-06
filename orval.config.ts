import { defineConfig } from 'orval';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

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
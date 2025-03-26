# MyRecipeBook Frontend

This repository is a submodule of the [MyRecipeBook Full-Stack Application](https://github.
com/damasceno-dev/myRecipeBook), which consists of three main parts:
- Infrastructure (AWS resources)
- Backend API
- Frontend Application (this repository)

## About the Application

MyRecipeBook is a modern web application that helps users manage their recipes with a beautiful and intuitive interface. The application features:

- 🔐 Secure authentication with Google OAuth
- 🌙 Dark mode support
- 📱 Responsive design for all devices
- 🔍 Advanced recipe search and filtering
- 🤖 AI-powered recipe generation
- 📝 Easy recipe creation and management

### Screenshots

#### Login Screen
![Login Screen](images-example/1-login-screen.png)

#### Create New Recipe
![Create New Recipe](images-example/2-create-new-recipe.png)

#### AI Recipe Generation
![AI Recipe Generation 1](images-example/3-generate-with-ai-1.png)
![AI Recipe Generation 2](images-example/3-generate-with-ai-2.png)

#### Recipes Dashboard and Search
![Recipes Dashboard](images-example/4-recipes-dashboard-and-search.png)

## Configuration

### Environment Variables

1. Copy the example environment file:
```bash
cp env-production-example .env.production
```

2. Update the following variables in `.env.production`:

```env
# Backend API URL (from AppRunner deployment)
NEXT_PUBLIC_API_URL=https://your-apprunner-service-url

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth Configuration
NEXTAUTH_URL=https://your-amplify-web-url
NEXTAUTH_SECRET=your_nextauth_secret
```

3. **IMPORTANT**: After setting the `NEXT_PUBLIC_API_URL`, you must generate the API types and functions for production:
```bash
npm run generate:prod
```
This step is crucial as it ensures that the frontend application is properly configured to communicate with the production backend API.

## Development

### Standard Development Environment

To run the application locally:

```bash
# Install dependencies
npm install

# Generate API types and functions for development
npm run generate:dev

# Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### HTTPS Development Environment

For testing features that require secure connections (like OAuth), you can run the application with HTTPS:

1. Create an HTTPS environment file:
```bash
cp env-local-https-example .env.local.https
```

2. Update the environment variables in `.env.local.https`:
```env
# Use HTTPS URLs for development
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXTAUTH_URL=https://localhost:3000
```

3. Generate API types and functions for HTTPS development:
```bash
npm run generate:dev:https
```

4. Start the HTTPS development server:
```bash
npm run dev:https
```

The application will be available at `https://localhost:3000`

> **Note**: The HTTPS development server uses a self-signed certificate. Your browser will show a security warning - this is expected in development. You can proceed by accepting the security risk.

### Available NPM Scripts

- `npm run dev`: Start the development server (HTTP)
- `npm run dev:https`: Start the development server with HTTPS
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run generate:dev`: Generate API types and functions for development environment
- `npm run generate:dev:https`: Generate API types and functions for HTTPS development environment
- `npm run generate:prod`: Generate API types and functions for production environment

## Deployment
The instructions focus on AWS deployment as the other projects are AWS-based; however, feel free to deploy
wherever suits your needs.

Steps to deploy using AWS Amplify:

1. Log in to the AWS Management Console
2. Navigate to AWS Amplify
3. Click "New app" → "Host web app"
4. Connect to your GitHub repository
5. Configure the build settings
6. Deploy the application
7. Note down the Amplify application URL

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

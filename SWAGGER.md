# Swagger Implementation for Password Vault API

## Overview

This document provides information on the Swagger implementation for Password Vault APIs. Swagger UI has been integrated to provide an interactive documentation and testing interface for all API endpoints.

## Features

- **Interactive API Documentation**: Visual and interactive representation of all API endpoints
- **API Testing Interface**: Ability to test API endpoints directly from the browser
- **Authentication Support**: Built-in authentication flow for testing secure endpoints
- **Request/Response Examples**: Clear examples of expected inputs and outputs
- **Error Documentation**: Comprehensive documentation of possible errors and status codes

## Accessing Swagger UI

When the server is running, you can access the Swagger UI at:

```
http://localhost:4000/api-docs
```

## Available Endpoints

### Health

- **GET /api/health** - Server health check endpoint

### Authentication

- **POST /api/auth/register** - Register a new user account
- **POST /api/auth/login** - Authenticate a user and get token
- **GET /api/auth/verify** - Verify authentication token

### Users

- **GET /api/users/profile** - Get authenticated user's profile

### Vault

- **GET /api/vault** - Get all vault entries for authenticated user
- **GET /api/vault/{id}** - Get a specific vault entry
- **POST /api/vault** - Create a new vault entry
- **PUT /api/vault/{id}** - Update an existing vault entry
- **DELETE /api/vault/{id}** - Delete a vault entry

## Testing Process

1. Start the server with `npm run dev` from the server directory
2. Access Swagger UI at `http://localhost:4000/api-docs`
3. Register or login to obtain an authentication token
4. Click the "Authorize" button and enter your token as `Bearer your_token_here`
5. Test the various endpoints using the interactive UI

## Implementation Details

The Swagger implementation uses:

- **swagger-jsdoc**: For generating Swagger definitions from JSDoc comments
- **swagger-ui-express**: For providing the Swagger UI interface

Key files:

- **config/swagger.js**: Main Swagger configuration
- **index.js**: Swagger setup and initialization
- **routes/\*.js**: API endpoint documentation via JSDoc comments
- **models/index.js**: Schema documentation

## Notes

- For security, avoid using production credentials when testing with Swagger UI
- Remember that the API uses client-side encryption for vault items
- Check the API_TESTING.md file for more detailed usage instructions

## Troubleshooting

If you encounter any issues with the Swagger UI:

1. Ensure the server is running properly
2. Check that you're using the correct authorization format (`Bearer token`)
3. Verify the API endpoint parameters match the documentation
4. Consult the server logs for detailed error information

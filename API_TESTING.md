# API Documentation for Password Vault

This document describes how to use the Swagger UI to test and verify the Password Vault API endpoints.

## Accessing the Swagger UI

When the server is running, you can access the Swagger UI at:

```
http://localhost:4000/api-docs
```

## Using Swagger UI

### Authentication

To test authenticated endpoints:

1. First, use the `/api/auth/register` or `/api/auth/login` endpoints to get a token
2. Click the "Authorize" button at the top of the Swagger UI
3. In the "Value" field, enter your token in the format: `Bearer your_token_here`
4. Click "Authorize" to apply the token to all subsequent requests

### Available Endpoints

The API is divided into several categories:

#### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login with email and password
- **GET /api/auth/verify** - Verify authentication token (requires authentication)

#### User Endpoints

- **GET /api/users/profile** - Get user profile (requires authentication)

#### Vault Endpoints

- **GET /api/vault** - Get all vault entries (requires authentication)
- **GET /api/vault/{id}** - Get a specific vault entry (requires authentication)
- **POST /api/vault** - Create a new vault entry (requires authentication)
- **PUT /api/vault/{id}** - Update a vault entry (requires authentication)
- **DELETE /api/vault/{id}** - Delete a vault entry (requires authentication)

### Testing Process

1. **Register a User**: Create a new user account using the `/api/auth/register` endpoint
2. **Authenticate**: Use the token from registration or login with the "Authorize" button
3. **Create Vault Entries**: Use the `POST /api/vault` endpoint to create encrypted entries
4. **Retrieve & Verify**: Use the `GET /api/vault` endpoints to verify your data is stored correctly
5. **Update & Delete**: Test the update and delete functionality as needed

## Notes on Encryption

The Password Vault uses client-side encryption. When testing through Swagger UI:

- The `ciphertext` should be encrypted on the client side before sending
- The `nonce` should be generated and sent with the ciphertext
- These values are stored as-is and returned when requested

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200/201` - Success
- `400` - Bad request (missing or invalid data)
- `401` - Authentication failure
- `404` - Resource not found
- `500` - Server error

For detailed error information, check the response body which contains a message field explaining the issue.

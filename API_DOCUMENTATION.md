# Password Vault API Documentation

This document outlines all the API endpoints available in the Password Vault application. These endpoints allow for user authentication, vault item management, and other core functionality.

## Base URL

All API requests should be prefixed with the base URL:

```
http://localhost:4000/api
```

For production deployment, replace with your actual domain.

## Authentication

### Register a New User

**Endpoint**: `POST /auth/register`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "name": "John Doe",
  "encSalt": "base64EncodedSalt"
}
```

**Response**:

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Login

**Endpoint**: `POST /auth/login`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Response**:

```json
{
  "token": "jwt_token_here",
  "_id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "encSalt": "base64EncodedSalt"
}
```

### Verify Token

**Endpoint**: `GET /auth/verify`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Response**:

```json
{
  "valid": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Vault Items

All vault endpoints require authentication via JWT token in the Authorization header.

### Get All Vault Items

**Endpoint**: `GET /vault`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Response**:

```json
[
  {
    "_id": "item_id_1",
    "ciphertext": "encrypted_data_base64",
    "nonce": "nonce_base64",
    "userId": "user_id",
    "createdAt": "2023-05-10T14:23:10.123Z",
    "updatedAt": "2023-05-10T14:23:10.123Z"
  }
  // More vault items...
]
```

### Create Vault Item

**Endpoint**: `POST /vault`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Request Body**:

```json
{
  "ciphertext": "encrypted_data_base64",
  "nonce": "nonce_base64"
}
```

**Response**:

```json
{
  "_id": "new_item_id",
  "ciphertext": "encrypted_data_base64",
  "nonce": "nonce_base64",
  "userId": "user_id",
  "createdAt": "2023-05-10T14:23:10.123Z",
  "updatedAt": "2023-05-10T14:23:10.123Z"
}
```

### Get Single Vault Item

**Endpoint**: `GET /vault/:id`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Response**:

```json
{
  "_id": "item_id",
  "ciphertext": "encrypted_data_base64",
  "nonce": "nonce_base64",
  "userId": "user_id",
  "createdAt": "2023-05-10T14:23:10.123Z",
  "updatedAt": "2023-05-10T14:23:10.123Z"
}
```

### Update Vault Item

**Endpoint**: `PUT /vault/:id`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Request Body**:

```json
{
  "ciphertext": "new_encrypted_data_base64",
  "nonce": "new_nonce_base64"
}
```

**Response**:

```json
{
  "_id": "item_id",
  "ciphertext": "new_encrypted_data_base64",
  "nonce": "new_nonce_base64",
  "userId": "user_id",
  "createdAt": "2023-05-10T14:23:10.123Z",
  "updatedAt": "2023-05-10T15:30:22.456Z"
}
```

### Delete Vault Item

**Endpoint**: `DELETE /vault/:id`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Response**:

```json
{
  "message": "Vault item deleted successfully"
}
```

## User Profile

### Get User Profile

**Endpoint**: `GET /user/profile`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Response**:

```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "encSalt": "base64EncodedSalt",
  "createdAt": "2023-05-01T10:20:30.123Z"
}
```

### Update User Profile

**Endpoint**: `PUT /user/profile`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Request Body**:

```json
{
  "name": "John Updated Doe",
  "email": "updated@example.com"
}
```

**Response**:

```json
{
  "_id": "user_id",
  "email": "updated@example.com",
  "name": "John Updated Doe",
  "updatedAt": "2023-05-15T11:22:33.456Z"
}
```

### Change Password

**Endpoint**: `PUT /user/password`

**Headers**:

```
Authorization: Bearer jwt_token_here
```

**Request Body**:

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewStrongerPassword456!",
  "newEncSalt": "new_base64_encoded_salt"
}
```

**Response**:

```json
{
  "message": "Password updated successfully"
}
```

## Error Responses

All endpoints return standard error codes and messages:

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Description of the error"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

### 500 Server Error

```json
{
  "error": "Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. Exceeding this limit will result in a 429 Too Many Requests response.

## CORS Policy

By default, the API allows requests from:

- http://localhost:3000
- Your production domain

For custom domain access, please contact the API administrator.

## API Versioning

The current API version is v1, which is implied in the base URL. Future versions will be explicitly versioned (e.g., `/api/v2/`).

## Support

For API support and bug reports, please contact:

- Email: api-support@passwordvault.com
- GitHub: https://github.com/Akcthecoder200/Password-Vault/issues

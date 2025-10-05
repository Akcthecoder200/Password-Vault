# Password Vault

A secure, modern password management application with client-side encryption.

![Password Vault](https://via.placeholder.com/800x400?text=Password+Vault)

## Features

- **Client-Side Encryption**: All sensitive data is encrypted in the browser before being sent to the server using XChaCha20-Poly1305 encryption
- **Password Generation**: Built-in secure password generator with customizable options
- **Advanced Search & Filtering**: Find passwords quickly with powerful search functionality
- **Password Strength Analysis**: Visual indicators of password strength
- **Group View**: Organize passwords by category, domain, or strength
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Secure Authentication**: User authentication with encryption key derivation using Argon2id

## Tech Stack

### Frontend

- **Next.js**: React framework for server-rendered applications
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **libsodium-wrappers**: For client-side cryptography operations

### Backend

- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database
- **JSON Web Tokens (JWT)**: For secure authentication
- **bcrypt**: For server-side password hashing

## Security Features

- **Zero-Knowledge Architecture**: Your master password never leaves your device
- **Client-Side Encryption**: All vault items are encrypted before being sent to the server
- **Secure Key Derivation**: Password-based key derivation using Argon2id
- **No Plain-Text Storage**: Passwords are never stored in plain text, even in memory
- **XChaCha20-Poly1305**: Modern authenticated encryption for all vault items
- **Session Management**: Secure session handling with automatic timeouts

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/Akcthecoder200/Password-Vault.git
cd Password-Vault
```

2. Install dependencies for both client and server

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create environment files

   - Create a `.env` file in the server directory with the following variables:

   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/password-vault
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRY=24h
   ```

   - Create a `.env.local` file in the client directory:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

4. Start the application

```bash
# Start the server
cd server
npm run dev

# In a new terminal, start the client
cd client
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Registration and Login

1. Create an account with a strong master password
2. Your encryption key is derived from this password - make sure to remember it!
3. Log in with your credentials to access your vault

### Adding Passwords

1. Click "Add New Password" on the dashboard
2. Enter the website details, username, and password
3. All data is encrypted in your browser before being stored

### Searching and Filtering

1. Use the search bar to find specific passwords
2. Filter by website, username, or other criteria
3. Sort by various fields including most recently used

### Generating Secure Passwords

1. Navigate to the Password Generator tool
2. Customize length and character types
3. Generate and copy secure passwords

## Development Setup

### Running Tests

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

### Building for Production

```bash
# Build the client
cd client
npm run build

# Start the production build
npm start
```

## Troubleshooting

### Common Issues

#### Encryption Not Initialized

If you see "Encryption is not initialized" errors:

1. Clear browser cache and session storage
2. Log out and log back in
3. Ensure you're using the same password you registered with

#### API Connection Issues

If the client cannot connect to the server:

1. Verify the server is running
2. Check that the `NEXT_PUBLIC_API_URL` environment variable is correct
3. Look for CORS issues in the browser console

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [libsodium](https://github.com/jedisct1/libsodium) for encryption
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Next.js](https://nextjs.org) for the React framework
- [MongoDB](https://www.mongodb.com) for database

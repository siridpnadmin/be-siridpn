# TITLE

DESCRIPTIONS

## Getting Started

1. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Then configure database settings in the `.env` file.

   or you can generate .env with command:

   ```bash
   yarn secret
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up database**

   ```bash
   yarn db:create && yarn db:reset
   ```

   Or create your database manually

4. **Start development server**

   ```bash
   yarn dev
   ```

   With file watching:

   ```bash
   yarn dev:watch
   ```

## Deployment

### Release Process

```bash
yarn release
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t yourname/express:v1.0.0 .

# Run the container
docker run -p 7000:8000 -d yourname/express:v1.0.0
```

## Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:create` - Create database
- `npm run db:reset` - Reset database schema
- `npm run release` - Release a new version

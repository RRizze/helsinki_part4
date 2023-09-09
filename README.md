## This is only a local setup (with a docker mongo), without using a mongo atlas.

## Installation / build

Add .env file with MONGODB_URI and API_PORT env variables.
For example:

```sh
MONGODB_URI=mongodb://root:secret@127.0.0.1:27017/test
API_PORT=3002
```

Build and run dev. setup:
```sh
cd backend
docker compose up -d
npm run dev
```

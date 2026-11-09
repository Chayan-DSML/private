
  # Tourbhook Website New

  This is a code bundle for Tourbhook Website New. The original project is available at https://www.figma.com/design/x3otznFlnr2z6ruyMdZkl8/Tourbhook-Website-New.

  ## Running the code

  Run `npm i` to install the website dependencies.

  Run `npm --prefix server i` to install the API dependencies.

  Copy `server/.env.example` to `server/.env`. Set `DATABASE_PASSWORD`, `JWT_SECRET`, and `ADMIN_PASSWORD`. The API uses MySQL through the Cloud SQL Auth Proxy on `127.0.0.1:3306`.

  Start the Auth Proxy with `INSTANCE_CONNECTION_NAME`, then run `npm --prefix server run dev` and `npm run dev`. The site proxies `/api` to the API on port 8787.

  Public forms save leads. Admin reads require `POST /api/admin/login` and a `Bearer` JWT.
  
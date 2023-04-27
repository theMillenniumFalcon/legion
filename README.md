# legion

An API proxy server with an easy-to-use dashboard for adding or editing middlewares and secrets.

## Tech and major tools used in this project:

- React and Next.js are used in the frontend using typescript.
- PostgreSQL is used as a database.
- Prisma is the ORM in this project.
- Redis is used as a cache store.
- Chakra UI is used as the component library.

## Features
- A user friendly dashboard.
- Query parameters and request headers forwarding.
- Encrypted Secrets that get dynamically injected when making request.
- Request and Response structure preservation.
- One-click middlewares for:
  - IP/HTTP restriction
  - Rate-limiting
  - Caching

## Config / Secrets environment variables

Copy `.env.example` from the server folder to `.env` and add your private information

*Note: never commit this file, it should be ignored by Git*

```
DATABASE_URL=
REDIS_URL=
SECRETS_KEY=
SECRETS_IV=
```

## Setup database
In the root of this project, run the following command to setup the database schema
```bash
npx prisma db push
```

## Explore the database
Prisma Studio makes it easy to explore and edit the data in the database. You can start it by running
```bash
npx prisma studio
```
Prisma Studio will be running at port `5555`.

## Installation

### SSH

```bash
git clone git@github.com:theMillenniumFalcon/legion.git
```

### GitHub CLI

```bash
gh repo clone theMillenniumFalcon/legion
```

### HTTPS

```bash
git clone https://github.com/theMillenniumFalcon/legion
```


```bash
npm install
```

## Running the app

```bash
# development
npm run dev

# production mode
npm run build
```

## Project Structure

### client
    .
    ├── components              # components for building the UI
    ├── lib                     # all the util functions
    ├── pages                   # nextJS pages
    ├── prisma                  # prsima configuration
    ├── public                  # assets
    ├── types                   # types
    └── ...

### I have another question!

Feel free to ask us on [Twitter](https://twitter.com/nishankstwt)! You can also email us at nishankpr2002@gmail.com.

### Dev team

- [Nishank Priydarshi](https://themillenniumfalcon.github.io)
- [Gunjan A. Bhanarkar](https://github.com/gunjan1909)
- [Naman Kumawat](https://www.instagram.com/nxmxn_21)
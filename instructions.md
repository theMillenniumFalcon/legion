Steps to run project locally:
- Spin up two docker containers, one for postgres database and another for maintaining the redis store using instructions given in commands.md file
- After both the containers are running fine, make a .env file by copying the keys given in .env.example file
- A sample for the keys and values for the .env file is given below:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/legion"

REDIS_URL="redis://localhost:6379"

SECRETS_KEY="AES256-32-bytes-hexadecimal-string"
# Example - "7387037c9716a739ae6a80232cfce456"

SECRETS_IV="AES256-16-bytes-hexadecimal-string"
# Example - "979f27a599b31ab7"
```
- Run `npx prisma db push` to synchronize the database with the schema
- Run `npm install` to install all the dependencies 
- Run `npm run dev` to view project locally on port 3000
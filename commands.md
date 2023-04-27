```
docker run --name psql-legion -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
```

```
docker exec -it psql-legion bash
```

```
psql -h localhost -U postgres
```
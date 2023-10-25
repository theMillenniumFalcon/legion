## postgres
```
docker run -d --name psql-legion -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
```

```
docker exec -it psql-legion bash
```

```
psql -h localhost -U postgres
```

## redis
```
docker run -d --name redis-legion -p 6379:6379 redis
```

```
docker exec -it redis-legion bash
```

```
redis-cli
```
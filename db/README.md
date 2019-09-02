# Froogle 2 DB

Create the Froogle2 schema like this:

```sh
cd db
sqlite3 froogle.db
```

Froogle2 schema relies upon and auth schema. Make sure that's built first.

e.g.: in SQLITE create user tables. Paste the auth schema in first.

Then paste the Froogle2 expenses and domains tables in next.

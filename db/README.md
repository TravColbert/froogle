# Froogle 2 DB

Create the Froogle2 schema like this:

```sh
cd db
sqlite3 froogle.db
```

Make sure that .db file is WRITABLE by the CGI. Most likely www-data. Do
this:

```sh
chgrp www-data db/froogle.db
chmod g+w db/froogle.db
```

Froogle2 schema relies upon and auth schema. Make sure that's built first.

e.g.: in SQLITE create user tables. Paste the auth schema in first.

Then paste the Froogle2 expenses and domains tables in next.

## Agregate Functions

### Tabulate Expenses by Date

SELECT SUBSTR(date,1,10), SUM(amount) FROM expenses WHERE date <> '' GROUP BY SUBSTR(date,1,10);
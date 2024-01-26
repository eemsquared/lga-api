### Official submission for Apteum coding challenge

This is a backend application that exposes LGAs (Local Government Area) data stored in PostgreSQL through a RESTful API.

**Endpoints:**

- `/lgas`
  - Get all LGA resources
  - Query params:
    - _page_
- `/lgas/:id`
  - Get a single lga resource using `:id` as the lga identifier

**Limitations:**

1. The dataset was stored locally. You might need to download the dataset yourself.

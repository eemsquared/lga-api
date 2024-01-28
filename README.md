## Official submission for Apteum coding challenge

This backend application exposes LGAs (Local Government Area) data stored in PostgreSQL through a RESTful API.

**Endpoints:**

- `/lgas`
  - Get all LGA resources
  - Query params:
    - _page_
- `/lgas/:id`
  - Get a single lga resource using `:id` as the lga identifier
- `/lgas/info`
  - Get the missing info based on the file provided

### Code Explanation

1. For endpoint `/lgas/:id`

   - An `id` parameter is retrieved from the request params.
   - Validate if id is an integer. Return a `400` error code if not.
   - Query the database using the `:id` value as the lga identifier.
   - If found, return the resource, if not, return a `404 Not Found exception`

2. For endpoint `/lgas` with pagination

   - A query parameter `page` is used to hold the page number you want to query, and has a default value of `1`
   - Sample request `http://localhost:3000/lgas?page=1`

3. For endpoint `/lgas/info`

   - This endpoint will return the missing LGA info of the properties from the `properties.js` file
   - The logic is to get the latitude and longitude values from the `geom` column of the dataset, and then cross-reference these to the latitude and longitude values from
     the `properties.js` file

   **_Note: This endpoint returns an empty response. A possible reason could be I wasn't able to get the correct latitude and longitude values from the dataset._**

4. Getting the population data

   - To get the population data, I used the formula `ST_Area()` and multiplied the value by the average population density of Victoria, Australia

**Limitations:**

1. The dataset was stored locally. You need to download the dataset yourself.

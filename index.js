require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const { propertiesJson } = require("./properties");

//create Express.js application instance and set port
const app = express();
const port = 3000;

//constants for pagination
const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

app.get("/lgas/info", async (req, res) => {
  try {
    const command = `SELECT 
      gid, 
      pfi, 
      lga_code, 
      lga_name, 
      gaz_lga, 
      gazregn
      , 
      abslgacode, 
      pfi_cr, 
      ufi, 
      ufi_cr, 
      ufi_old, 
      ST_X(ST_Centroid(geom)) as x, 
      ST_Y(ST_Centroid(geom)) as y 
    FROM vic_lga`;
    const data = await query(command);

    const matchingData = [];
    for (const d of data) {
      const match = propertiesJson.find(
        (p) => p.longitude === d.x && p.latitude === d.y
      );

      if (match) {
        matchingData.push(data, p);
      }
    }

    res.json(matchingData);
  } catch (error) {
    console.error("Error getting lga resource: ", error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
});

//route handler to GET requests to lgas/:id where :id is the dynamic lga identifier
app.get("/lgas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    //check if :id is an integer
    if (!Number.isInteger(Number(id))) {
      res.status(400).json({ message: "Id must be an integer" });
      return;
    }

    //sql command to get an lga resource using lga identifier
    const command = `SELECT *, CEIL((ST_Area(geom, true) / 1000000) * 29.14) as est_pop FROM vic_lga WHERE gid = $1`;
    const data = (await query(command, [id]))[0];

    //return 404 status code if lga identifier is not found
    if (!data) {
      res.status(404).json({ message: "LGA not found" });
    }
    //return data as json
    res.json(data);
  } catch (error) {
    //return 500 status code for internal server errors
    console.error("Error getting lga resource: ", error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
});

//get all lga resources
app.get("/lgas", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    if (!Number.isInteger(Number(page))) {
      res.status(400).json({ message: "page must be a number" });
      return;
    }
    const offset = page > 0 ? (page - 1) * DEFAULT_LIMIT : DEFAULT_OFFSET;
    const command = `SELECT *, CEIL((ST_Area(geom, true) / 1000000) * 29.14) as est_pop FROM vic_lga LIMIT $1 OFFSET $2`;
    const data = await query(command, [DEFAULT_LIMIT, offset]);
    const totalPages = await getTotalPages();

    res.json({
      data,
      currentPage: Number(page),
      totalPages,
    });
  } catch (error) {
    console.error("Error getting lga resource: ", error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
});

//starts the server and listens for incoming requests
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Helper functions //

//establish database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//helper function to query the database
async function query(query, params) {
  try {
    const client = await pool.connect();
    const result = await client.query(query, params);
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

async function getTotalPages() {
  try {
    const command = `SELECT COUNT(*) FROM vic_lga`;
    const count = (await query(command))[0].count;
    return Math.ceil(count / DEFAULT_LIMIT);
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

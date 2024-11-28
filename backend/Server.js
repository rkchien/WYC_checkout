import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

// Convert __dirname to ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// Front-end Back-end stuff
const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));


// Load environment variables from .env file
dotenv.config();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Login route
app.post('/auth/login', async (req, res, next) => {
  try {
    const entered_wycnumber = req.body.wycnumber;
    const entered_password = req.body.password;

    console.log('Entered credentials:', entered_wycnumber, entered_password);

    // Step 1: Retrieve WYCNumber and hashed password from the database
    const query1 = `
      SELECT WYCNumber, password 
      FROM WYCDatabase 
      WHERE WYCNumber = ?
    `;

    const [rows1] = await pool.query(query1, [entered_wycnumber]);

    if (rows1.length === 0) {
      console.log('No matching WYCNumber found.');
      return res.status(401).json({ message: 'Authentication failed: invalid username' }); // Unauthorized
    }

    const { WYCNumber, password: stored_hashed_password } = rows1[0];
    console.log('WYCNumber from DB:', WYCNumber);
    console.log('Stored hashed password:', stored_hashed_password);

    // Step 2: Hash the entered password to compare with the stored hash
    const query2 = `
      SELECT CONCAT('*', UPPER(SHA1(UNHEX(SHA1(?))))) AS hashed_password
    `;

    const [rows2] = await pool.query(query2, [entered_password]);

    if (rows2.length === 0 || !rows2[0].hashed_password) {
      console.log('Failed to hash entered password.');
      return res.status(500).json({ message: 'Password hashing failed' });
    }

    const entered_hashedpassword = rows2[0].hashed_password;
    console.log('Entered hashed password:', entered_hashedpassword);

    // Step 3: Compare the hashed passwords
    if (stored_hashed_password !== entered_hashedpassword) {
      console.log('Password mismatch.');
      return res.status(401).json({ message: 'Authentication failed: wrong password' }); // Unauthorized
    }

    // Step 4: Fetch full user details after successful password verification
    const query3 = `
      SELECT WYCNumber, First, Last, Phone1, Email, Category, image_name, password
      FROM WYCDatabase
      WHERE WYCNumber = ?
    `;

    const [rows3] = await pool.query(query3, [entered_wycnumber]);

    if (rows3.length === 0) {
      console.log('No user details found for WYCNumber.');
      return res.status(404).json({ message: 'User details not found' });
    }

    const user = rows3[0];
    console.log('Logged in as:', user.First + " " + user.Last);

    // Step 5: Send successful response with user details
    return res.status(200).json({ message: 'Login successful', user });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'An unexpected error occurred during login' });
  }
});

app.get('/api/boats', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM boat_types');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching boats:', error);
    res.status(500).send('An error occurred while fetching boats');
  }
});

app.get('/api/checkouts', async (req, res) => {
  try {
    const status = req.query.status;
    let query = `
      SELECT 
          checkouts.*,
          (SELECT CONCAT(First, ' ', Last) FROM WYCDatabase WHERE WYCDatabase.WYCNumber = checkouts.WYCNumber) AS MemberName,
          (SELECT CONCAT(First, ' ', Last) FROM WYCDatabase WHERE WYCDatabase.WYCNumber = checkouts.ChiefID) AS ChiefName,
          (SELECT type FROM boat_types WHERE boat_types._index = Boat) AS BoatName,
          (SELECT text FROM ratings WHERE ratings._index = RelevantRating) AS RatingName,
          DATE_FORMAT(ExpectedReturn, '%l:%i%p %W %c/%e') AS FormattedExpectedReturn,
          DATE_FORMAT(TimeDeparture, '%l:%i%p %W %c/%e') AS FormattedTimeDeparture,
          DATE_FORMAT(TimeReturn, '%l:%i%p %W %c/%e') AS FormattedTimeReturn,
          CASE 
              WHEN TimeReturn IS NULL THEN 'Out' 
              ELSE 'In' 
          END AS Status
      FROM 
          checkouts`;

    if (status === 'out') {
      query += ` WHERE TimeReturn IS NULL`;
    } else if (status === 'in') {
      query += ` WHERE TimeReturn IS NOT NULL`;
    } else {
      throw new Error('Invalid status parameter');
    }

    //fix limit for out boats
    query += ` ORDER BY checkouts._index DESC LIMIT 10`;

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    res.status(500).send('An error occurred while fetching checkouts');
  }
});

app.get('/api/ratings', async (req, res) => {
  try {
    const wycnumber = req.query.wycnumber;
    const [rows] = await pool.query(
      `SELECT * FROM wyc_ratings LEFT JOIN ratings ON wyc_ratings.rating = ratings._index WHERE member = ?`,
      [wycnumber]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).send('An error occurred while fetching ratings');
  }
});

app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    console.log('Submitting form:', formData);

    await pool.query(
      'INSERT INTO checkouts (WYCNumber, TimeDeparture, Crew, Boat, RelevantRating, ChiefID, Destination, ExpectedReturn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        formData.WYCNumber,
        formData.TimeDeparture,
        formData.Crew,
        formData.Boat,
        formData.RelevantRating,
        formData.ChiefID,
        formData.Destination,
        formData.ExpectedReturn
      ]
    );

    console.log('Form Submitted');
    res.status(200).send('Form submitted successfully');
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).send('An error occurred while submitting the form');
  }
});

app.post('/api/check-in', async (req, res) => {
  try {
    const index = req.body.index;
    console.log(index);
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(`Checking In Boat at '${date}'`);
    await pool.query(`UPDATE checkouts SET TimeReturn = '${date}' WHERE checkouts._index = ${index}`);

    console.log('Boat Checked In');
    res.status(200).send('Boat checked in successfully');
  } catch {
    console.error(`Error Checking In Boat with Index: `)
    res.status(500).send('An error occurred while checking in this boat');
  } 
})


// Check if the index.html file exists in the client/build directory
var indexPath = path.join(__dirname, 'client', 'build', 'index.html');
if (!fs.existsSync(indexPath)) {
  indexPath = path.join(__dirname, '../wyc-boat-checkout/public/index.html');
}

// For all other routes, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error sending file ${indexPath}:`, err);
      res.status(500).send('Error serving index.html');
    }
  });
});

// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

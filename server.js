const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const ExcelJS = require('exceljs');

const app = express();
let userData = [];

// Function to read from the Excel file and create "Users" worksheet if it doesn't exist
const createUsersWorksheet = async () => {
    const workbook = new ExcelJS.Workbook();
    
    try {
        // Attempt to read the existing Excel file
        await workbook.xlsx.readFile('data1.xlsx');
        console.log('Available worksheets:', workbook.worksheets.map(sheet => sheet.name));

        // Check if the "Users" worksheet already exists
        let worksheet = workbook.getWorksheet('Users');
        if (!worksheet) {
            // If it doesn't exist, create it
            console.log('Worksheet "Users" not found. Creating it...');
            worksheet = workbook.addWorksheet('Users');
            // Add headers for the new worksheet
            worksheet.columns = [
                { header: 'Username', key: 'name', width: 30 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Password', key: 'password', width: 30 }
            ];
            // Save the workbook after adding the new worksheet
            await workbook.xlsx.writeFile('data1.xlsx');
            console.log('Worksheet "Users" created and saved successfully.');
        } else {
            console.log('Worksheet "Users" already exists.');
        }
    } catch (err) {
        console.error('Error reading or creating Excel file:', err);
    }
};

// Function to read user data from Excel file
const readExcelFile = async () => {
    const workbook = new ExcelJS.Workbook();
    try {
        // Attempt to read the existing Excel file
        await workbook.xlsx.readFile('data1.xlsx'); 
        console.log('Available worksheets:', workbook.worksheets.map(sheet => sheet.name));

        // Check for the "Users" worksheet
        let worksheet = workbook.getWorksheet('Users'); 
        if (!worksheet) {
            console.log('Worksheet "Users" not found. Creating it...');
            worksheet = workbook.addWorksheet('Users');
            worksheet.columns = [
                { header: 'Username', key: 'name', width: 30 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Password', key: 'password', width: 30 }
            ];
        }

        // Read data from the worksheet
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                const [name, email, password] = row.values.slice(1); // Skip index column
                userData.push({ name, email, password });
            }
        });
    } catch (err) {
        console.error('Error reading Excel file:', err);
    }
};

// Load data from JSON on server startup
fs.readFile('data.json', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }
    userData = JSON.parse(data); // Load user data from the JSON file
});

// Call the function to create the worksheet and read data from the Excel file at startup
(async () => {
    await createUsersWorksheet();
    await readExcelFile();
})();

// Middleware setup for parsing request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To parse JSON data

// POST request to handle signup
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        userData.push({ name, email, password: hashedPassword });

        // Save to JSON file
        fs.writeFile('data.json', JSON.stringify(userData, null, 2), (err) => {
            if (err) {
                console.error('Error saving to JSON file:', err);
            }
        });

        // Code for writing to Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('data1.xlsx'); // Read the existing file
        let worksheet = workbook.getWorksheet('Users');

        // Add the new user data to the worksheet
        worksheet.addRow({ name, email, password: hashedPassword });

        // Save the workbook to a file
        try {
            await workbook.xlsx.writeFile('data1.xlsx');
            console.log('Data saved successfully to data1.xlsx');
        } catch (error) {
            console.error('Error saving data:', error);
        }

        // Send successful response
        res.send("<p>User registered successfully!</p><a href='/viewUsers'>View Users</a>");
    } catch (err) {
        console.error('Error hashing password or writing to Excel file:', err);
        res.status(500).send('Server error. Please try again.');
    }
});

// Sign-in logic
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const user = userData.find(user => user.email === email);
    
    if (!user) {
        return res.status(401).send('User not found.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).send('Invalid password.');
    }

    res.send('Sign in successful! Redirecting to homepage...');
});

// View data in JSON format
app.get('/viewDataJson', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading JSON file.');
        }
        res.json(JSON.parse(data));
    });
});

// View users and download as Excel file
app.get('/viewUsers', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Data');
    worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 }
    ];

    // Add data to worksheet
    userData.forEach(user => {
        worksheet.addRow({ name: user.name, email: user.email });
    });

    // Save and send the Excel file
    const filePath = __dirname + "/users.xlsx";
    await workbook.xlsx.writeFile(filePath);
    res.download(filePath);
});

// OAuth callback endpoint
app.get('/oauth2callback', (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Error: No code returned from Google');
    }
    res.send(`OAuth callback received. Authorization code: ${code}`);
});

// **Place static file serving middleware AFTER your dynamic routes**
// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(__dirname));

// Start the server on port 3002
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

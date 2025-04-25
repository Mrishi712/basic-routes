const express = require('express');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');  // Import the basic auth module

const app = express();
const port = 8080;

// Set up Basic Authentication middleware for all endpoints.
app.use(basicAuth({
    users: { 'rishi': 'amrm' },  // Replace with your actual credentials
    challenge: true,  // This causes most browsers to show a popup for credentials.
    realm: 'MyApplication',   // An optional realm name, you can customize it.
    unauthorizedResponse: (req) => {
        // Provide a JSON response for unauthorized access.
        return req.auth
            ? { message: "Credentials rejected" }
            : { message: "No credentials provided" };
    }
}));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Enable JSON parsing for request bodies
app.use(express.json());

let students = [];

// Route to "/"
app.get('/', (req, res) => {
    res.send('Hello Rishi!');
});

// Load student data from testData.json
fs.readFile('testData.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    students = JSON.parse(data);
    console.log('JSON data loaded:', students);
});

// Route to add a new student
app.post('/add-student', (req, res) => {
    const { name, gender, physics, maths, english } = req.body;

    if (!name || !gender || physics === undefined || maths === undefined || english === undefined) {
        return res.status(400).json({ message: 'Incomplete data. Please provide name, gender, and marks for Physics, Maths, and English.' });
    }

    const newStudent = {
        name,
        gender,
        physics,
        maths,
        english
    };

    students.push(newStudent);

    fs.writeFile('testData.json', JSON.stringify(students, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({ message: 'Error saving data.' });
        }
        res.status(201).json({ message: 'Student added successfully!', student: newStudent });
    });
});

// Route to delete a student
app.delete('/delete-student/:name', (req, res) => {
    const { name } = req.params;

    const studentIndex = students.findIndex(s => s.name.toLowerCase() === name.toLowerCase());

    if (studentIndex !== -1) {
        const removedStudent = students.splice(studentIndex, 1)[0];
        fs.writeFile('testData.json', JSON.stringify(students, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return res.status(500).json({ message: 'Error saving data.' });
            }
            res.status(200).json({ message: 'Student deleted successfully!', student: removedStudent });
        });
    } else {
        res.status(404).json({ message: 'Student not found.' });
    }
});

// Route to get all students marks
app.get('/marks', (req, res) => {
    res.json(students);
});

// Route to get details of a single student's mark
app.get('/marks/:name', (req, res) => {
    const { name } = req.params;
    const student = students.find(s => s.name.toLowerCase() === name.toLowerCase());

    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
});

// Start the application
app.listen(port, () => {
    console.log(`Access http://localhost:${port}`);
});

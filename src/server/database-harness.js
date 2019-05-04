/**
 *  A module to clear the database and preload data into the database for
 *  testing
 */

let request = require('request-promise-native');

let users = require('./mockdata/tutors');
let courses = require('./mockdata/classes');

const connections = [
    {
        connector: "bailey.pearson@vanderbilt.edu",
        connectee: "anjie.wang@vanderbilt.edu",
    },
    {
        connector: "bailey.pearson@vanderbilt.edu",
        connectee: 'jesse.d.seales@vanderbilt.edu',
    }
];


/**
 *  loads the courses into the database
 */
let loadCourses = async () => {
        try {
            let data = {
                method: 'POST',
                uri: 'http://localhost:8080/v1/class',
                body: courses,
                json: true
            };
            
            await request(data);

        } catch (err) {
            console.log(err);
        }
};

/**
 *  loads the users into the database
 */
let loadUsers = async () => {
    for (let i=0; i<users.length; ++i) {
        try {
            let data = {
                method: 'POST',
                uri: 'http://localhost:8080/v1/user',
                body: users[i],
                json: true
            };

            await request(data);

        } catch (err) {
            console.log(err);
        }
    }
};

/**
 *  loads the connections into the database
 */
let loadConnections = async () => {
    for (let i=0; i<connections.length; ++i) {
        try {
            let data = {
                method: 'POST',
                uri: 'http://localhost:8080/v1/connection',
                body: connections[i],
                json: true
            };

            const res = await request(data);

            data = {
                method: "PUT",
                uri: `http://localhost:8080/v1/connection/${res._id}`,
                body: {
                    status: "ACCEPTED"
                },
                json: true,
            };
            await request(data);
        } catch (err) {
            console.log(err);
        }
    }
};


/*********************************************************************************
*
*                                  begin exports
*
*********************************************************************************/

/**
 *  clearDatabase
 *  removes all documents from the database
 */
module.exports.clearDatabase = async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.db.dropDatabase();
};

/**
 *  preloadDatabase
 *  pre-loads data into the database
 */
module.exports.preloadDatabase = async () => {
    await loadCourses();
    await loadUsers();
    // process.exit();
    // await loadConnections();
};

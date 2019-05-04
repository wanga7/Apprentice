/* Copyright G. Hemingway, @2018 */
"use strict";

let path = require("path"),
	fs = require("fs"),
	http = require("http"),
	https = require("https"),
	express = require("express"),
	bodyParser = require("body-parser"),
	logger = require("morgan"),
	redis = require('redis'),
	session = require("express-session"),
	RedisStore = require('connect-redis')(session),
	mongoose = require("mongoose"),
    util = require('util'),
    harness = require('./database-harness.js');

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "dev";

/*********************************************************************************************************
*
*			configuration functions
*
**********************************************************************************************************/

/**
 * Not really necessary yet, and it doesn't work but eventually
 * 	we will probably want to deploy with https
 */
const configureHttps = () => {
	const options = {
		key: fs.readFileSync(conf.security.keyPath),
		cert: fs.readFileSync(conf.security.certPath)
	};
	// Listen for HTTPS requests
	server = https.createServer(options, app).listen(port, () => {
		console.log(`Secure Assignment 5 listening on: ${server.address().port}`);
	});

	// Redirect HTTP to HTTPS
	http.createServer((req, res) => {
		const location = `https://${req.headers.host}${req.url}`;
		console.log(`Redirect to: ${location}`);
		res.writeHead(302, { Location: location });
		res.end();
	})
	.listen(80, () => {
		console.log(`Assignment 5 listening on 80 for HTTPS redirect`);
	});
};

const setupMongoDB = async () => {
	// Connect to MongoDB
	try {
		console.log("Connecting to MongoDB");
		mongoose.set("useFindAnyModify", false); // New deprecation warnings
		mongoose.set("useCreateIndex", true); // New deprecation warnings
		await mongoose.connect(conf.mongodb, {
			useNewUrlParser: true, // New deprecation warnings
		});

		// rearranged order to allow use of api after the api has gone up
		// if (!process.env.PRODUCTION) {
		// 	// await mongoose.connection.db.dropDatabase();
		// 	console.log('database cleared');
		// }

		console.log(`MongoDB connected: ${conf.mongodb}`);

	} catch (err) {
		console.log(err);
		process.exit(-1);
	}
};

const setupSession = app => {
	const redisOptions = {
		HOST : 'localhost',
		PORT : 6379,
	};

	app.store = session({
		name: "session",
		store : new RedisStore(redisOptions),
		secret: "apprentice",
		resave: false,
		saveUninitialized: false,
		cookie: {
			path: "/"
		}
	});

	app.use(app.store);

	//Establish connection to Redis
  	app.redisClient = redis.createClient(redisOptions.PORT,redisOptions.HOST);
  	app.redisClient
	.on("ready", () => {
		console.log("\tRedis Connected.");
    }).on("error", () => {
		console.log("Not able to connect to Redis.");
		process.exit(-1);
    });
};

/**********************************************************************************************************/

let conf = {
	port: 8080,
	redis: {
		host: 'localhost',
		port: 6379
	},
	mongodb: `mongodb://localhost:27017/apprentice-${process.env.PRODUCTION ? 'production' : 'dev'}`,
	base_url: `http://localhost:8080`,
	certs: {
		private_key: fs.readFileSync('./config/server.key').toString(),
		rl_cert: fs.readFileSync('./config/vandy.crt').toString(),
	}
};

const setupServer = async () => {
	// Get the app config
	require('dotenv').config();

	// let conf = env === "production" ? tmp.production : tmp;
	const port = process.env.PORT ? process.env.PORT : conf.port;

	// startup express pipeline
	let app = express();
	if (env !== "test") app.use(logger("dev"));
	app.engine("pug", require("pug").__express);
	app.set("views", __dirname);
	app.use(express.static(path.join(__dirname, "../../public")));

	app.conf = conf;

	// Finish with the body parser
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	// no redis support yet
	await setupSession(app);
	await setupMongoDB();

	// Import our Data Models
	require('./models/index')(app);



	// Import our routes
	require("./api")(app);

	// Give them the SPA base page
	app.get("*", (req, res) => {
		// const user = req.session.user;
		res.render("base.pug",{});
	});

	// Run the server itself
	let server;
	if (env === "production") {
		configureHttps();
	} else {
	  	harness.clearDatabase();
			harness.preloadDatabase(app);

      let startServer = () => {
          return new Promise((resolve,reject) => {
              app.listen(port,() => {
                  console.log(`Apprentice listening on: ${port}`);
                  resolve();
              });
          });
      };

        try {
            await startServer();

        } catch (err) {
            console.log(err);
        }
	}
};

/**********************************************************************************************************/

// Run the server
setupServer();

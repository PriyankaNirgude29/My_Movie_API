
// Import Express, Morgan, Body-parser
const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      path = require('path');

      
const app = express();
const port = process.env.PORT || 8080;

// Import and use CORS, set allowed origins
const cors = require('cors');
app.use(cors());

// Import express-validator to validate input fields
const { check, validationResult } = require('express-validator');


app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Import auth.js file
let auth = require('./auth')(app);

// Require passport module & import passport.js file 
const passport = require('passport');
require('./passport');

// Import Mongoose, models.js and respective models defined in model.js
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// Connecting to MongoDB database of movies
mongoose.connect(process.env.CONNECTION_URI || "mongodb://localhost:27017/test", { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

/**
 * GET: Returns welcome message for '/' request URL
 * @returns Welcome message
 */
app.get("/", (req, res) => {
    res.send("Welcome to myFlix")
})

/**
 * GET: Returns a list of ALL movies to the user
 * Request body: Bearer token
 * @returns array of movie objects
 * @requires passport
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });

});

/**
 * GET: Returns data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
 * Request body: Bearer token
 * @param Title
 * @returns movie object
 * @requires passport
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        if(movie){
           res.status(200).json(movie);
        }else{
          res.status(400).send('Movie not found.');
       };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: Returns data about a user data (username,passwors,email,birthday) by username
 * Request body: Bearer token
 * @param Username (of user)
 * @returns user object
 * @requires passport
 */
 app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
        if(user){
           res.status(200).json(user);
        }else{
        res.status(400).send('User not found.');
       };
  })
  .catch((err) => {
    console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: Returns data about a genre (name, description) by name (e.g., “Comedy”)
 * Request body: Bearer token
 * @param Name (of genre)
 * @returns genre object
 * @requires passport
 */
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
        if(movie){
           res.status(200).json(movie.Genre);
        }else{
          res.status(400).send('Genre not found.');
       };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: Returns data about a director ( name, bio,birth year,death year) by director name 
 * Request body: Bearer token
 * @param Name (of director)
 * @returns director object
 * @requires passport
 */
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
        if(movie){
           res.status(200).json(movie.Director);
        }else{
          res.status(400).send('Director not found.');
       };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * POST: Allows new users to register; Username, Password & Email are required fields!
 * Request body: Bearer token, JSON with user information
 * @returns user object
 */
app.post('/users', [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    let errors = validationResult(req);

     if (!errors.isEmpty()) {
       return res.status(422).json({ errors: errors.array() });
     }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
          if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
          } else {
             Users
               .create({
                   Username: req.body.Username,
                   Password: hashedPassword,
                   Email: req.body.Email,
                   Birthday: req.body.Birthday
                })
              .then((user) =>{res.status(201).json(user) })
              .catch((error) => {
                 console.error(error);
                 res.status(500).send('Error: ' + error);
                 })
               }
            })
           .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
           });
});


/**
 * PUT: Allow users to update their user info (find by username)
 * Request body: Bearer token, updated user info
 * @param Username
 * @returns user object with updates
 * @requires passport
 */
app.put('/users/:Username', [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', { session: false }), (req, res) => {
    let errors = validationResult(req);

     if (!errors.isEmpty()) {
       return res.status(422).json({ errors: errors.array() });
     }

    let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * POST: Allows users to add a movie to their list of favorites
 * Request body: Bearer token
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * DELETE: Allows users to remove a movie from their list of favorites
 * Request body: Bearer token
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID }},
      { new: true },
     (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
  });
});

/**
 * DELETE: Allows existing users to deregister
 * Request body: Bearer token
 * @param Username
 * @returns success message
 * @requires passport
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Static File
app.use('/static', express.static('public'));

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Listen for request
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

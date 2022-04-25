const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      path = require('path');

const { check, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 8080;

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI || "mongodb://localhost:27017/test", { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.get("/", (req, res) => {
    res.send("Welcome to myFlix")
})

//READ : Return a list of ALL movies to the user
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

//READ : Return a list of ALL users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });

});

//READ : Return data using Movie Title
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

//READ : Return data of user using username
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

//READ : Return data of Genre using Genre name
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

//READ : Return data of Director using Director name
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


//  CREATE : Register or Add New User
app.post('/users', [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],(req, res) => {

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


//   UPDATE : Update User information by UserName
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


// CREATE : Add a movie to a user's list of favorites
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

// DELETE : Delets User's Favorite movie
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

// DELETE : De-Register or Delete User
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

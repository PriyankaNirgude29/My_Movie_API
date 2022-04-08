const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      path = require('path');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

let topmovies = [
    {
        title: 'Avatar(2009)',
        director: 'James Cameron',
        genre:  {
            Name:'Action, Science-fiction',
            description: '',
        },
    },
    {
        title: 'Avengers:Endgame',
        director: 'Anthony Russo,Joe Russo',
        genre:  {
            Name:'Action, Science-fiction',
            description: '',
        },
    },
    {
        title: 'The Dark Knight(2008)',
        director: 'Christopher Nolan',
        genre:  {
            Name:'Action, Adventure',
            description: '',
        },
    },
    {
        title: 'Titanic Movie',
        director: 'James Cameron',
        genre:  {
            Name:'Romance, Drama',
            description: '',
        },
    },
    {
        title: 'Uri : The surgical strike',
        director: 'Aditya Dhar',
        genre:  {
            Name:'War, Action',
            description: '',
        },
    },
    {
        title: '3 Idiots',
        director: 'Rajkumar Hirani',
        genre:  {
            Name:'Comedy, Drama',
            description: '',
        },
    },
    {
        title: 'Jurassic Park',
        director: 'Steven Spielberg',
        genre:  {
            Name:'Sci-Fi, Adventure',
            description: '',
        },
    },
    {
        title: 'The Pursuit of Happyness',
        director: 'Gabriele Muccino',
        genre:  {
            Name:'Biography',
            description: '',
        },
    },
    {
        title: 'MS Dhoni : The untold story',
        director: 'Neeraj Pandey',
        genre:  {
            Name:'Biography, Sport, Drama',
            description: '',
        },
    },
    {
        title: 'Interstellar',
        director: 'Christopher Nolan',
        genre:  {
            Name:'Sci-Fi',
            description: '',
        }
    }

];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.get("/", (req, res) => {
    res.send("Welcome to myFlix")
})

//Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
    res.status(200).json(topmovies);
});

//Static File
app.use('/static', express.static('public'));

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Listen for request
app.listen(8080, () =>{
    console.log('Your app is listening on port 8080.');
});

const express = require('express'),
     morgan = require('morgan'),
     bodyParser = require('body-parser');
  
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

let topmovies = [
    {
        title: 'Life Is Beautiful(1997)',
        director: 'Roberto Benigni',
        genre:  {
            Name:'Drama, Comedy, War',
            description: '',
        },
    },
    {
        title: 'Inception(2010)',
        director: 'Christopher Nolan',
        genre:  {
            Name:'Sci-Fi',
            description: '',
        },
    },
    {
        title: 'The Dark Knight(2008)',
        director: 'Christopher Nolan',
        genre:  {
            Name:'Action, Crime, Drama',
            description: '',
        },
    },
    {
        title: 'Joker',
        director: 'Todd Phillips',
        genre:  {
            Name:'Thriller, Crime',
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
        title: 'In Time',
        director: 'Andrew Niccol',
        genre:  {
            Name:'Sci-Fi',
            description: '',
        },
    },
    {
        title: 'Gandhi',
        director: 'Richard Attenborough',
        genre:  {
            Name:'Biography',
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

app.get("/", (req, res) => {
    res.send("Welcome to myFlix")
})

//Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
    res.status(200).json(topmovies);
});


//Static File
app.use(express.static('public'));

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Listen for request
app.listen(8080, () =>{
    console.log('Your app is listening on port 8080.');
});

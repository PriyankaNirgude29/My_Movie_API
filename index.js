const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      path = require('path'),
      uuid = require('uuid');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: 'John Thomas',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Anne Schmidt',
    favoriteMovies: ['Jurassic Park']
  },
];

let movies = [
    {
        title: 'Avatar(2009)',
        director: {
           Name: 'James Cameron',
           Bio: '',
           Birth: '',
        },
        genre: {
            Name:'Science-fiction',
            Description: ''
        },
    },
    {
        title: 'Avengers:Endgame',
        director: {
           Name: 'Anthony Russo,Joe Russo',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Action',
            Description: '',
        },
    },
    {
        title: 'The Dark Knight(2008)',
        director: {
           Name: 'Christopher Nolan',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Adventure',
            Description: '',
        },
    },
    {
        title: 'Titanic Movie',
        director: {
           Name: 'James Cameron',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Romance',
            Description: '',
        },
    },
    {
        title: 'Uri : The surgical strike',
        director: {
           Name: 'Aditya Dhar',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'War',
            Description: '',
        },
    },
    {
        title: '3 Idiots',
        director: {
           Name: 'Rajkumar Hirani',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Comedy',
            Description: '',
        },
    },
    {
        title: 'Jurassic Park',
        director: {
           Name: 'Steven Spielberg',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Adventure',
            Description: '',
        },
    },
    {
        title: 'The Pursuit of Happyness',
        director: {
           Name: 'Gabriele Muccino',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Biography',
            Description: '',
        },
    },
    {
        title: 'MS Dhoni : The untold story',
        director: {
           Name: 'Neeraj Pandey',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Drama',
            Description: '',
        },
    },
    {
        title: 'Interstellar',
        director: {
           Name: 'Christopher Nolan',
           Bio: '',
           Birth: '',
        },
        genre:  {
            Name:'Drama',
            Description: '',
        }
    }

];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.get("/", (req, res) => {
    res.send("Welcome to myFlix")
})

//READ : Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

//READ : Return data using Movie Title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.title===title);
  if(movie){
    res.status(200).json(movie);
  }else{
    res.status(404).send('No such Movie!!!')
  }
})

//READ : Return data of Genre using Genre name
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const Genre = movies.find(movie => movie.genre.Name === genreName).genre;
  if(Genre){
    res.status(200).json(Genre);
  }else{
    res.status(404).send('No such Genre!!!')
  }
})

//READ : Return data of Director using Director name
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const Director = movies.find(movie => movie.director.Name === directorName);
  if(Director){
    res.status(200).json(Director);
  }else{
    res.status(404).send('No such Director!!!')
  }
})


//  CREATE : Register or Add New User
app.post('/users',(req,res)=>{
  const NewUser = req.body;
  if(NewUser.name){
    NewUser.id = uuid.v4();
    users.push(NewUser);
    res.status(201).json(NewUser)
  }else{
    res.status(400).send('Users need Names !!')
  }
})

//   UPDATE : Update User Name
app.put('/users/:id',(req,res)=>{
  const { id } = req.params;
  const updatedUser = req.body;

  let User = users.find(User => User.id == id);
  if(User){
    User.name = updatedUser.name;
    res.status(200).json(User);
  }else{
    res.status(400).send('No Such User !!')
  }
})

// CREATE : Add User's Favorite movie
app.post('/users/:id/:movieTitle',(req,res)=>{
  const { id,movieTitle } = req.params;

  let User = users.find(User => User.id == id);
  if(User){
    User.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id} s Array`);
  }else{
    res.status(400).send('No Such User !!')
  }
})

// DELETE : Delets User's Favorite movie
app.delete('/users/:id/:movieTitle',(req,res)=>{
  const { id,movieTitle } = req.params;

  let User = users.find(User=>User.id==id);
  if(User){
    User.favoriteMovies = User.favoriteMovies.filter(title=>title!==movieTitle);
      res.status(200).send(`${movieTitle} has been removed from use ${id} s Array`);
  }else{
    res.status(400).send('No Such User !!')
  }
})

// DELETE : De-Register or Delete User
app.delete('/users/:id',(req,res)=>{
  const { id } = req.params;

  let User = users.find(User=>User.id==id);
  if(User){
    users = users.find(User=>User.id!=id)
    res.status(200).send(`User ${id} has been removed !!!`)
  }else{
    res.status(400).send('No Such User !!')
  }
})

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

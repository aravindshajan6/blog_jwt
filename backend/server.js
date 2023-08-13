const express  = require('express'); 
const app = express(); //app instance
const dotenv = require('dotenv'); //env variables
const path = require('path');
const {check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3030

app.use(express.urlencoded({extended:true})); //get user input in backend
app.use(cookieParser());

app.use(express.static('public'));
app.use(express.static('../client'));
app.use(express.static('../client/css'));
app.use(express.static('../client/images/fcards'));
app.use(express.static('../client/images'));


const infoPath = path.join(__dirname, '../client/info.html');
const signupPath = path.join(__dirname,'../client/signup.html');
const homePath = path.join(__dirname,'../client/index.html');
const loginPath = path.join(__dirname, '../client/login.html');

dotenv.config({path:'./config/config.env'}); //dotenv path

//internal DB array

const users = [
    {username:'sam', 
    password:'123', 
    email:'sam@gmail.com'},
];

var signupValidate = [
    check('userName').isLength({min:3}).withMessage('Username must be minimum 3 characters').trim(),
    check('email').isEmail().withMessage('must be a valid email address'),
    check('password').isLength({min:3, max:10}).withMessage('password must be between 3 and 10 characters!').trim()
]


//route signup 
app.get('/', (req, res) => {
    res.sendFile(signupPath);
});

app.post('/', signupValidate, (req, res) => {
    const { userName, email, password } = req.body;
    console.log(userName, email, password);
    //get errors if any
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors:errors.array()});
    } else {
        const newUser = {
            username : req.body.userName,
            password : req.body.password,
            email : req.body.email,
        }
        users.push(newUser);
        console.log(users);
        res.status(200).redirect('/login.html');
    } 
});

//login route 
app.get('/login.html', (req, res ) => {
    res.sendFile(loginPath);
} );

app.post('/login.html', (req, res) => {
    console.log(req.body);
    const loginUser = {
        userName : req.body.userName,
        password : req.body.password,
    }

    const user = users.find((data) => data.username === loginUser.userName && data.password === loginUser.password);
    if(user) {
        console.log('user found!');
        //create payload for token
        const data = {
            username:loginUser.userName,
            date:Date(),
        };

        //create token using sign()
        const token = jwt.sign(data, process.env.SECRET_KEY, ({expiresIn:"10min"}));
        console.log(token);


        res.cookie('token', token).redirect('index.html');
    } else {
        console.log('User not found!');
    }
})


app.get('/info.html', (req, res) => {
    res.sendFile(infoPath);
});
app.get('/index.html', (req, res) => {
    res.redirect(homePath);
});




app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}`)
});
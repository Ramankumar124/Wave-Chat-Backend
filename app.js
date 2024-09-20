const express = require('express');
const cors = require('cors');
const { registerUser ,loginUser} = require('./controllers/authController');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT;
const cookieParser=require('cookie-parser');
const { userData } = require('./routes/userData');
const { isLogin } = require('./middlewares/isLogin');


app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
})
);

app.post('/register',registerUser);
app.post('/login',loginUser)

app.get('/userData', isLogin,userData );

app.listen(PORT, function () {
    console.log(`Server running at Port ${PORT}`);
});

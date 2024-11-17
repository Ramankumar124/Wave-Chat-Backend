require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const { isLogin } = require('./middlewares/isLogin');
const { userData } = require('./routes/userData');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoute=require('./controllers/notificationController')
const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
try {

  app.use('/auth', authRoutes)
  app.use('/chat', isLogin, chatRoutes)
  app.get('/', (req, res) => {
    res.send('Server is running');
  });
  app.get('/userData', isLogin, userData);
  app.use('/Notification',isLogin,notificationRoute)
  console.log(
    "routes look perfect"
  );

} catch (error) {
  console.log(error);


}

module.exports = app;

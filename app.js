require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const { isLogin } = require('./middlewares/isLogin');
const { userData, AllUserList, updateUser } = require('./routes/userData');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoute=require('./controllers/notificationController');
const { gemmniChat } = require('./routes/gemmniChat');
const upload = require('./config/multerConfig');
const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://wave-chat-rho.vercel.app/',
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
  app.get('/get-all-users',AllUserList);
  app.post('/updateUser',upload.single('profilePicture'),isLogin,updateUser);
  app.use('/Notification',isLogin,notificationRoute)
  app.get('/gemmniChat',gemmniChat);
  console.log(
    "routes look perfect"
  );

} catch (error) {
  console.log(error);


}

module.exports = app;

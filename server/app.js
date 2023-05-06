const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const messageRoutes = require('./routes/messageRoutes')
const socket = require("socket.io");


// Server Setup
const app = express()
const port = process.env.PORT || 8000

// MONGO DB Connection
mongoose.connect(`mongodb+srv://esmercene:${process.env.MONGODB_PASSWORD}@cluster0.t5xp9id.mongodb.net/chatmeapp?retryWrites=true&w=majority`,
{
	useNewUrlParser: true,
	useUnifiedTopology: true
})
let db = mongoose.connection

db.on('error',  () => console.error("Connection Error"))
db.once('open', () => console.log("Connected to MONGODB"))


// To avoid CORS errors when trying to send request to our server
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);




// Server Listening
const server = app.listen(port, () => console.log(`Server is running on localhost: ${port}`))


const io = socket(server, {
	cors: {
	  origin: "http://localhost:3000",
	  credentials: true,
	},
  });
  
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
	global.chatSocket = socket;
	socket.on("add-user", (userId) => {
	  onlineUsers.set(userId, socket.id);
	});
  
	socket.on("send-msg", (data) => {
	  const sendUserSocket = onlineUsers.get(data.to);
	  if (sendUserSocket) {
		socket.to(sendUserSocket).emit("msg-recieve", data.msg);
	  }
	});
  });
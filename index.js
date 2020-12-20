const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require("mongoose")
const UserSchema = require("./schema/userSchema");
const BoardSchema = require('./schema/boardSchema')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

// mongoose connection
mongoose.connect("mongodb+srv://mohanareact:prakash@cluster0.s9ken.mongodb.net/users?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true},()=>{
  console.log("Mongo Atlas Connected");
})

// http setUp
const server = http.createServer(app);

// io setUp
const io = socketio(server);

// cross origin resource sharing
app.use(cors()); 

// Home Router
app.get("/", (req, res) => {
  res.status(200).send("Server Running.");
});

// const boards = async()=>{
  // const as = await  new BoardSchema({
    const board =[
      {
        name:"General",
        message:[{
          topic:"Work",
          message:["task 1 finished","finish the task 2","task 3 will be given tommorow"]
        },
        {
          topic:"Development",
          message:["nav shoould be developed tommorow","table should be given today"]
        }
      ]
      },
  
      {
        name:"Marketing",
        message:[{
          topic:"Work",
          message:["task 1 finished","finish the task 2","task 3 will be given tommorow"]
        },
        {
          topic:"Development",
          message:["nav shoould be developed tommorow","table should be given today"]
        }
      ]
      }
    ]
  // })
  // const saveChat=await as.save()
  // console.log(saveChat)
  // }
  // boards()

// connect
io.on('connect', (socket) => {
    // user signup 
  socket.on('signup', async({socketID,name,email,password }) => {
    // console.log(socketID,"...",name,",,,,,,,",email,",,,,,",password,",,,,,,")
    const signedUser = await UserSchema.findOne({email:email})
    if(signedUser){
      socket.emit('existingUser')
    }else{
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        const newUser = await new UserSchema({
        id:socketID,
        name:name,
        email:email,
        password:hashedPassword,
        board:["General","Marketing"],
        templates:["Buissness","Design","Education","Marketing","Engineering","HR & Operations","Personal","Productivity","Product Management","Project Management","Sales","support"],
        menuoption:["Boards","Templates","Home"],
      })
      const saveUser=await newUser.save()
      // console.log(saveUser)
  
      socket.emit('signed',saveUser)
    }
  });
  // user login
  socket.on('login', async({name,password }) => {
    // console.log(name,",,,,,",password)
    const dbUser = await UserSchema.findOne({email:name})
    // console.log(dbUser,"popopopopopopop");
    const match = bcrypt.compareSync(password, dbUser.password); 
      
      if(match) {
        socket.emit('boards',dbUser,password)
      }else{
        socket.emit('incorrect')
      }
  });
  socket.on("getuser",async(id)=>{
    const dbUser = await UserSchema.findOne({_id:id})
    const boards=board.map(e=>{
      return e.name
    })
    const boardNames = {dbUser,boards}
    console.log(boardNames.boards);
    socket.emit("getmenu",boardNames)
  })
  socket.on("join",(chatroom)=>{
    socket.join(chatroom)
        const boardname = board.filter((user) => user.name === chatroom)
        
        socket.emit("oldmessage",boardname)
  })
  socket.on('newTodoValue',(values)=>{
    console.log(values)
    const chatroom = values.chatRoom
    const index = values.i
    const value = values.InputValues
    const boards = board.filter((user) => user.name === chatroom)
    const addary= boards[0].message[index].message
    addary.push(value)
    // console.log(addary,"Lllll")
  })
  socket.on('newCard',(addCard)=>{
    const chatroom = addCard.chatRoom
    const Topic=addCard.addNewInput
    const boards = board.filter((user) => user.name === chatroom)
    const addBoard=boards[0].message
    const addTopic={
      topic:Topic,
      message:[]
    }
    addBoard.push(addTopic)
  })
  socket.on('newBoard',(modalTeam)=>{
    const teamName = modalTeam.teamName
    const teamDescription = modalTeam.teamDescription
    // console.log(teamName,teamDescription)
    const newBoard = {
      name:teamName,
      message:[]
    }
    board.push(newBoard)
    console.log(board)
    socket.emit('asdf',newBoard)
  })
  // user disconnect
  socket.on('disconnect', () => {
  })
});

server.listen(process.env.PORT || 3001, () => console.log(`Server running on port 5000.`));
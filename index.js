const express = require("express");
const { connection } = require("./db");
const { userRouter } = require("./routes/userRoutes");
const { noteRouter } = require("./routes/notesRoutes");
const cors = require("cors")

const app = express();
app.use(cors());
app.use(express.json())
app.use("/users", userRouter)
app.use("/notes", noteRouter)

app.get("/", (req, res)=>{
    res.send("Welcome to Full Stack - CRUD")
})

app.listen(8080, async()=>{
    try {
        await connection;
        console.log("Connected to Database")
        console.log("Server is live at Port 8080")
    } catch (error) {
        console.log(error)
    }
})
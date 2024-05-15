import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from "cors";
import bodyParser from 'body-parser'
import {useMessages} from "./history/messages.js";
import {v4} from "uuid";

const PORT = 8080

const app = express()
const messages = useMessages()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    let user = ''
    let room = ''

    socket.on('join', (data) => {
        const msg = messages.joinUser(data.user, data.room)
        socket.join(data.room)
        room = data.room
        user = data.user

        socket.emit('status', messages.getOnline(data.room))
        socket.broadcast.to(data.room).emit('status', { name: data.user, status: 'online' })
        if(msg) {
            socket.broadcast.to(data.room).emit('getMessage', msg)
        }
    })

    socket.on('history', (data) => {
        const res = messages.getHistory(data.user, data.room)
        socket.emit('getHistory', res)
    })

    socket.on('message', (data) => {
        const msg = {
            text: data.text,
            from: data.from,
            date: new Date().toISOString(),
            status: 'save'
        }
        messages.saveMessage(msg, room)

        socket.emit('getMessage', msg)

        socket.broadcast.to(room).emit('getMessage', msg)
    })


    socket.on('disconnect', () => {
        if(user && room) messages.leaveUser(user, room)
        socket.broadcast.to(room).emit('status', { name: user, status: 'offline' })
    })
})

app.use('/create-room', (req, res) => {
    const { name, password, username } = req.body
    const id = v4()
    messages.createRoom(id, name, password, username)
    res.send({
        room: id
    })
})

app.use('/', (req, res) => {
    res.send({
        title: 'SUCCESS'
    })
})

app.use('/room', (req, res) => {
    const { room } = req.body
    const data = messages.getName(room)
    if(data.error) return res.status(404).send()
    res.send(data)
})

app.use('/get-room', (req, res) => {
    const { name, password } = req.body
    const uuid = messages.getUUID(name, password)
    res.send({
        uuid
    })
})

console.log(`STARTED ON ${PORT}`)
server.listen(PORT)
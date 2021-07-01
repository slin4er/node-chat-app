const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { fileURLToPath } = require('url')
const {generateMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))

const message = 'Добро пожаловать!)'

io.on('connection', (socket) => {
    console.log('New user connection')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if(error) {
            return callback(error)
        }
    
        socket.join(user.room)

        socket.emit('message', generateMessage('Робик', message))
        socket.broadcast.to(user.room).emit('message', generateMessage('Робик',`${user.username} забрался к нам`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

    })

    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('countUpdated', count)
    //     io.emit('countUpdated', count)
    // })

    socket.on('sendMessage', (sms, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter
        if(filter.isProfane(sms)){
            return callback('Маты запрещены!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, sms))
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateMessage(user.username, 'https://google.com/maps?q=' + location.latitude + ',' + location.longitude))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Робик', `${user.username} вышел(`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('server is up on port ' + port)
})
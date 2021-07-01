const users = []

//addUser
const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!room || !username) {
        return {
            error: 'Никнейм и комната обязательны к заполнению'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: 'Такое имя уже используется'
        }
    }

    const user = {id, username, room}

    users.push(user)
    return {user}
}

//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
    return {
        error: "Пользователя не существует!"
    }
}

//getUser

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//getUsersInRoom
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
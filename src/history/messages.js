const messages = {}
export const useMessages = () => {
    let users = []
    const messages = {}

    const createRoom = (id, name, password, username) => {
        messages[id] = {
            name,
            password,
            users: [],
            msg: []
        }
    }

    const getName = (room) => {
        if(!messages[room]) return { error: 'not-found' }
        return {
            title: messages[room].name,
            users: getOnline(room)
        }
    }

    const getUUID = (nameRoom, password) => {
        let uuid = null
        Object.keys(messages).forEach(i => {
            if(messages[i].name === nameRoom && messages[i].password === password) {
                uuid = i
            }
        })
        return uuid
    }

    const getOnline = (room) => {
        if(!messages[room]) return { error: 'not-found' }
        return messages[room].users.map(i => ({ name: i, status: 'online' }))
    }

    const joinUser = (user, room) => {
        if(!messages[room]) return false

        if(!messages[room].users.includes(user)) {
            const msg = {
                text: `Пользователь ${user} подключился`,
                from: 'admin',
                date: new Date().toISOString(),
                status: 'save'
            }
            messages[room].users = [...messages[room].users, user]
            messages[room].msg.push(msg)

            if (!users.find(i => i.user === user)) users.push({user})
            return msg
        }
        if (users.find(i => i.user === user)) return
        users.push({user})
        return false
    }

    const leaveUser = (user, room) => {
        users = users.filter(i => i !== user)
    }

    const getHistory = (user, room) => {
        if(!messages[room]) return []

        return messages[room].msg
    }

    const saveMessage = (data, room) => {
        messages[room].msg.push(data)
    }


    return {
        joinUser,
        getHistory,
        saveMessage,
        createRoom,
        getName,
        leaveUser,
        getOnline,
        getUUID
    }
}
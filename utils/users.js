let users = [];

// Join user to room
function userJoin(id, username, room, readyStatus, points, isReading) {
    const user = { id, username, room, readyStatus, points, isReading};

    users.push(user)

    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}


// User leaves room
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);


    if (index !== -1){
        const thisUser = users[index];

        // Remove user from userlist
        users.splice(index, 1);

        const roomUsers = getRoomUsers(thisUser.room);

        // If there are no more human players left, remove all bots
        if (roomUsers.every(user => user.id.startsWith('bot'))) {
            removeBots(thisUser.room);
        }

        
        return thisUser;
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function setReadyStatus(id, rStatus){
    const thisUser = users.find(user => user.id === id);
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    users[index].readyStatus = rStatus;
    return thisUser;
}

function removeBots(room){
    users = users.filter(user => !(user.id.startsWith('bot') && user.room == room));
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    setReadyStatus,
    removeBots
}
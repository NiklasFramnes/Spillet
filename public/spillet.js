let hand = [];
let blackCardText = "";

// The amount of reply cards needed
let replyAmt;
let selectedCards = [];

//let replies = [];

let players = [1, 2, 3, 4, 5];

let isTrashing = false;
let trashedCardIndex = -1;

let readyStatus = false;

let replyCards = [];


// Networking
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const userList = document.getElementById('users');

const socket = io();

let isRoomLeader = false;
let isReader = false;

// Join room
socket.emit('joinRoom', { username, room} );

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputUsers(users);
});

console.log(username, room);

socket.on('message', message => {
    console.log(message);
});

socket.on('roomLeader', () => {
    isRoomLeader = true;
    document.getElementById('room-leader-settings').style.display = "block";
});

socket.on('startGame', blackCard => {
    blackCardText = blackCard.text;
    replyAmt = blackCard.replies;

    startGame();
});

socket.on('displayPointGoal', ptw => {
    document.getElementById('point-goal').style.display = 'flex';
    document.getElementById('point-goal').innerHTML = `First to ${ptw} points`
});

// Add all players username to DOM 
function outputUsers(users, winningPlayer){
    userList.innerHTML = "";
    users.forEach(user =>{
        const listElement = document.createElement('li');
        userList.appendChild(listElement);
        if (user.readyStatus){
            listElement.innerHTML = user.username + " - Ready";
        }
        else if (user.username == winningPlayer){
            listElement.innerHTML = user.username + " - " + user.points.toString() + "p" + " WINNER!!!";
        } 
        else if (user.isReading && user.points > 0){
            listElement.innerHTML = user.username + " - " + user.points.toString() + "p" + " - is reader";
        }
        else if (user.isReading){
            listElement.innerHTML = user.username + " - is reader";
        }
        else if (user.points > 0){
            listElement.innerHTML = user.username + " - " + user.points.toString() + "p";
        }
        else listElement.innerHTML = user.username;
    });
}

window.onload = function(){
   document.getElementById('game-board').style.display = 'none';
   document.getElementById('room-leader-settings').style.display = "none";
   document.querySelector('.new-game-button').style.display = 'none';
   document.getElementById('waiting-text').style.display = 'none';
   document.getElementById('point-goal').style.display = 'none';
   document.getElementById('next-card-button').style.display = 'none';

}

socket.on('drawCard', card => {
    hand.push(card);
    updateCards();
});

socket.on('revealReplies', replies => {
    revealReplies(replies);
});

socket.on('showNewCard', () => {
    const rc = replyCards.shift();
    rc.style.display = "block";

    // If all reply-cards are revealed, show vote-buttons 
    if (replyCards.length == 0){
        if (document.getElementById('vote-button1').style.visibility == "visible"){
            document.getElementById('vote-button1').style.display = "flex";
        }
        if (document.getElementById('vote-button2').style.visibility == "visible"){
            document.getElementById('vote-button2').style.display = "flex";
        }
        if (document.getElementById('vote-button3').style.visibility == "visible"){
            document.getElementById('vote-button3').style.display = "flex";
        }
        if (document.getElementById('vote-button4').style.visibility == "visible"){
            document.getElementById('vote-button4').style.display = "flex";
        }
        if (document.getElementById('vote-button5').style.visibility == "visible"){
            document.getElementById('vote-button5').style.display = "flex";
        }
        if (document.getElementById('vote-button6').style.visibility == "visible"){
            document.getElementById('vote-button6').style.display = "flex";
        }

        isReader = false;
    }
}); 

socket.on('isReading', () =>{
    isReader = true;
});

socket.on('revealVotes', ({users, votes, winningPlayer}) => {
    document.getElementById('waiting-text').style.display = 'none';
    
    outputUsers(users, winningPlayer);

    if (winningPlayer == "") document.getElementById('next-round-button').style.display = "flex";
    else if (isRoomLeader){
        document.querySelector('.new-game-button').style.display = 'flex';
    }
    else {
        document.getElementById('waiting-text').style.display = 'flex';
        document.getElementById('waiting-text').innerHTML = "Waiting for room leader to start new game..."

    }

    const name1 = document.getElementById('player-name1');
    const name2 = document.getElementById('player-name2');
    const name3 = document.getElementById('player-name3');
    const name4 = document.getElementById('player-name4');
    const name5 = document.getElementById('player-name5');
    const name6 = document.getElementById('player-name6');

    name1.style.display = "flex";
    name2.style.display = "flex";
    name3.style.display = "flex";
    name4.style.display = "flex";
    name5.style.display = "flex";
    name6.style.display = "flex";

    if (name1.innerHTML != "") name1.innerHTML = name1.innerHTML + " + " + votes[0].toString() + "p";
    if (name2.innerHTML != "") name2.innerHTML = name2.innerHTML + " + " + votes[1].toString() + "p";
    if (name3.innerHTML != "") name3.innerHTML = name3.innerHTML + " + " + votes[2].toString() + "p";
    if (name4.innerHTML != "") name4.innerHTML = name4.innerHTML + " + " + votes[3].toString() + "p";
    if (name5.innerHTML != "") name5.innerHTML = name5.innerHTML + " + " + votes[4].toString() + "p";
    if (name6.innerHTML != "") name6.innerHTML = name6.innerHTML + " + " + votes[5].toString() + "p";

});

socket.on('nextTurn', (blackCard) => {
    blackCardText = blackCard.text;
    replyAmt = blackCard.replies;
    nextRound();
});

socket.on('startNewGame', ({rLId, roomUsers}) => {
    if (rLId == socket.id){
        document.getElementById('room-leader-settings').style.display = "block";
    }
    document.getElementById('ready-button').style.display = "block";
    document.getElementById('ready-button').innerHTML = "Ready";
    readyStatus = false;
    outputUsers(roomUsers);
    document.getElementById('game-board').style.display = 'none';
    document.getElementById('waiting-text').style.display = 'none';
    document.getElementById('point-goal').style.display = 'none';
    hand = [];
});

function startGame(){
    document.getElementById('game-board').style.display = 'flex';
    document.getElementById("player-hand").style.display = "flex";
    document.getElementById("submit-button").style.display = "flex";
    document.getElementById('room-leader-settings').style.display = "none";

    selectedCards = [];

    updateCards();

    // Make cards clickable
    document.querySelectorAll('.hand-card').forEach(card => {
        card.addEventListener('click', cardClicked);
      });

    document.getElementById('reply-cards').style.display = "none";
    document.getElementById('ready-button').style.display = "none";
}

function toggleReady() {
    readyStatus = !readyStatus;
    console.log(readyStatus);
    document.getElementById('ready-button').innerHTML = readyStatus ? "Un-ready" : "Ready";

    // If room leader, send game settings to server
    if (isRoomLeader) {
        const pointsToWin = Number(document.getElementById('points-to-win').value);
        const fillWithBots = document.getElementById('fill-with-bots').checked;

        socket.emit('gameSettings', { ptw: pointsToWin, fwb: fillWithBots, id: socket.id });
    }

    //socket.emit('getBots');
    socket.emit('readyStatus', ({ id: socket.id, readyStatus}));

}

function cardClicked(){
    // if trash button is activated, trash the clicked card
    if (isTrashing){
        // Check if no card is already trashed and this card is not already selected
        const cardSelected = selectedCards.some(card => card.id === this.id);
        if (trashedCardIndex == -1 && !cardSelected){
            trashedCardIndex = this.id;
            hand.splice(trashedCardIndex, 1);
            isTrashing = false;
            socket.emit('requestDrawCard', socket.id);
            document.getElementById('trash-button').style.display = "none";
        }
    }
    else {
        // Select
    if (!containsCardWithId(this.id)){
        if (selectedCards.length < replyAmt){
            selectedCards.push( { text: this.innerHTML, id: this.id });
            const cardIndex = selectedCards.findIndex(card => card.id === this.id);
            this.classList.add('selected');
            if (replyAmt > 1) document.getElementById('order' + this.id).innerHTML = (cardIndex+1).toString();
        } 
    }
    // Unselect
    else {
        const cardIndex = selectedCards.findIndex(card => card.id === this.id);   
        selectedCards.splice(cardIndex, 1);
        this.classList.remove('selected');
        if (replyAmt > 1) {
            document.getElementById('order' + this.id).innerHTML = ""; 
            for (let c = 0; c < selectedCards.length; c++){
                document.getElementById('order' + selectedCards[c].id).innerHTML = (c+1).toString();
            }
        }
    }
    }
    
}

function containsCardWithId(cardId) {
    return selectedCards.some(card => card.id === cardId);
  }


function showReplyCards(isTrue) {
    const replyCardsContainer = document.getElementById("reply-cards");
    replyCardsContainer.style.visibility = isTrue ? "visible" : "hidden";
}

function updateCards () {
    // Hand
    for (let c = 0; c < 7; c++){
        document.getElementById(c.toString()).innerHTML = hand[c];
    }

    // Black Card
    document.querySelector(".black-card").innerHTML = blackCardText;
}

function submitCards () {
    if (selectedCards.length == replyAmt){

        let selectedCardsText = [];
        selectedCards.forEach(card => {
            selectedCardsText.push(card.text);
        })


        unselectAll();
        socket.emit('submitCards', ( { cards: selectedCardsText, id: socket.id, rplyAmt: replyAmt} ));
        document.getElementById('waiting-text').style.display = 'flex';
        document.getElementById('waiting-text').innerHTML = "Waiting for all players to submit cards..."
    }
    else alert("Du har ikke valgt mange nok kort");
}

function unselectAll() {  
    document.getElementById('0').classList.remove('selected');
    document.getElementById('1').classList.remove('selected');
    document.getElementById('2').classList.remove('selected');
    document.getElementById('3').classList.remove('selected');
    document.getElementById('4').classList.remove('selected');
    document.getElementById('5').classList.remove('selected');
    document.getElementById('6').classList.remove('selected');

    document.getElementById('order0').innerHTML = "";
    document.getElementById('order1').innerHTML = "";
    document.getElementById('order2').innerHTML = "";
    document.getElementById('order3').innerHTML = "";
    document.getElementById('order4').innerHTML = "";
    document.getElementById('order5').innerHTML = "";
    document.getElementById('order6').innerHTML = "";

    document.getElementById("player-hand").style.display = "none";
    document.getElementById("submit-button").style.display = "none";
}


function revealReplies(replies){
    document.getElementById('waiting-text').style.display = 'none';

    const amtOfReplies = replies.length;

   // Remove previous reply cards
   const oldReplyCards = document.querySelectorAll('.reply-card');
   oldReplyCards.forEach(replyCard => {
       replyCard.remove();
   });

    document.getElementById('trash-button').style.display = "none";

    document.getElementById('vote-button1').style.visibility = "hidden";
    document.getElementById('vote-button2').style.visibility = "hidden";
    document.getElementById('vote-button3').style.visibility = "hidden";
    document.getElementById('vote-button4').style.visibility = "hidden";
    document.getElementById('vote-button5').style.visibility = "hidden";
    document.getElementById('vote-button6').style.visibility = "hidden";

    //document.getElementById('vote-button1').style.display = "flex";
    //document.getElementById('vote-button2').style.display = "flex";
    //document.getElementById('vote-button3').style.display = "flex";
    //document.getElementById('vote-button4').style.display = "flex";
    //document.getElementById('vote-button5').style.display = "flex";
    //document.getElementById('vote-button6').style.display = "flex";

    document.getElementById('vote-button1').style.display = "none";
    document.getElementById('vote-button2').style.display = "none";
    document.getElementById('vote-button3').style.display = "none";
    document.getElementById('vote-button4').style.display = "none";
    document.getElementById('vote-button5').style.display = "none";
    document.getElementById('vote-button6').style.display = "none";

    // Gå gjennom alle replies fra alle spiller og lag kort av de
    for (let p = 0; p < amtOfReplies; p++){
        document.getElementById("player-name"+(p+1).toString()).innerHTML = replies[p].name;
        // Only show vote button for other players replies
        if (username != replies[p].name) {

            document.getElementById('vote-button'+(p+1).toString()).style.visibility = "visible";
        }
        for (let c = 0; c < replies[p].reply.length; c++){
            const newPlayerReply = document.createElement("white-card");
            newPlayerReply.setAttribute("class", "reply-card");
            newPlayerReply.textContent = replies[p].reply[c];
            newPlayerReply.style.display = "none";
            document.getElementById('player'+(p+1).toString()+'-replies').appendChild(newPlayerReply);
            
        }
    }

    const replyCardParent = document.getElementById('reply-cards');
    replyCardParent.style.display = "flex";


    document.getElementById('next-round-button').style.display = "none";

    document.getElementById('player-name1').style.display = "none";
    document.getElementById('player-name2').style.display = "none";
    document.getElementById('player-name3').style.display = "none";
    document.getElementById('player-name4').style.display = "none";
    document.getElementById('player-name5').style.display = "none";
    document.getElementById('player-name6').style.display = "none";

    replyCards = Array.from(document.querySelectorAll('.reply-card'));

    // If player is the reader
    if (isReader){
        document.getElementById('next-card-button').style.display = "block";
    }

}

function nextCard(){
    if (replyCards.length == 1){
        document.getElementById('next-card-button').style.display = "none";
    }

    socket.emit('requestShowNewCard', socket.id);
}

function vote(index){

    document.getElementById('vote-button1').style.display = "none";
    document.getElementById('vote-button2').style.display = "none";
    document.getElementById('vote-button3').style.display = "none";
    document.getElementById('vote-button4').style.display = "none";
    document.getElementById('vote-button5').style.display = "none";
    document.getElementById('vote-button6').style.display = "none";


    let playerVotedFor;

    for (let v = 0; v < 6; v++){
        if (v == index){
            playerVotedFor = document.getElementById('player-name'+(v+1)).innerText;
        }
    }

    socket.emit('voteForPlayer', {pv: playerVotedFor, voterId: socket.id, indx: index});
    document.getElementById('waiting-text').style.display = 'flex';
    document.getElementById('waiting-text').innerHTML = "Waiting for all players to vote..."
}

function readyForNextRound(){
    socket.emit('readyForNextRound', socket.id);
    document.getElementById('next-round-button').style.display = "none";
    document.getElementById('waiting-text').style.display = 'flex';
    document.getElementById('waiting-text').innerHTML = "Waiting for all players to hit next round..."
}

function nextRound(){    
    document.getElementById('waiting-text').style.display = 'none';
    
    // Remove played cards and Draw new cards
    const cardAmt = selectedCards.length;
    for (let c = 0; c < cardAmt; c++){
        hand.splice(hand.indexOf(selectedCards[c].text), 1);
        socket.emit('requestDrawCard', socket.id);
    }

    updateCards();
    selectedCards = [];


    document.getElementById('reply-cards').style.display = "none";
    document.getElementById("player-hand").style.display = "flex";
    document.getElementById("submit-button").style.display = "flex";


    // Reset trash button
    document.getElementById('trash-button').style.display = 'flex';
    isTrashing = false;
    trashedCardIndex = -1;
}

function toggleTrash(){
    if (!isTrashing)     alert("Trash er aktivert, trykk på det kortet du vil kaste, eller trykk på knappen igjen for å avbryte");
    else alert("Trash er deaktivert");
    isTrashing = !isTrashing;
}

function startNewGameButton(){
    document.querySelector('.new-game-button').style.display = 'none';
    socket.emit('requestStartNewGame', socket.id);
}

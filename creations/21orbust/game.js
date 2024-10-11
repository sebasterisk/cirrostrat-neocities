let deck = []
let dealer_hand = []
let player_hand = []
let player_hand_split = []

let money = 1000
let bet = 0

let valueofcards = 0
let dealervalueofcards = 0

const suits = ["&hearts;", "&diams;", "&spades;", "&clubs;"]
const truevalues = [11,2,3,4,5,6,7,8,9,10,10,10,10]
const displayvalues = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
const dealer_disp = document.getElementById("dealer")
const player_disp = document.getElementById("player")
const cardval = document.getElementById("cardval")
const dealercardval = document.getElementById("dealercardval")

const hitbtn = document.getElementById("hit")
const standbtn = document.getElementById("stand")
const againbtn = document.getElementById("again")
const statusdiv = document.getElementById("status")

// fisher-yates solution from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

function newdeck(){
    deck = []
    for (let i=0; i<4; i++){
        for (let j=1; j<=13; j++){
            deck.push({
                "suit":i,
                "val": j,
                "true": truevalues[j-1]
            })
        }
    }
    shuffle(deck)
    console.log(deck)
}

function deal(){
    dealer_hand = []
    player_hand = []
    for(let i=0; i<2; i++){
        let temp = deck.pop()
        dealer_hand.push(temp)
    }
    for(let i=0; i<2; i++){
        let temp = deck.pop()
        player_hand.push(temp)
    }
}
function listhand(dealer_reveal){
    valueofcards = 0
    dealervalueofcards = 0
    dealer_disp.innerHTML = ""
    player_disp.innerHTML = ""
    for(let i=0; i<dealer_hand.length; i++){
        let div = document.createElement("div")
        div.classList.add("card")
        if(i==0 && !dealer_reveal){
            div.classList.add("covered")
        } else {
            div.innerHTML=`${displayvalues[dealer_hand[i].val - 1]}${suits[dealer_hand[i].suit]}`
            dealervalueofcards += dealer_hand[i].true
        }
        dealer_disp.appendChild(div)
    }
    if (!dealer_reveal){
        dealercardval.innerHTML = dealervalueofcards + " + ?"
    }else{
        dealercardval.innerHTML = dealervalueofcards
    }

    for(let i=0; i<player_hand.length; i++){
        let div = document.createElement("div")
        div.classList.add("card")
        div.innerHTML=`${displayvalues[player_hand[i].val - 1]}${suits[player_hand[i].suit]}`
        player_disp.appendChild(div)
        
        if(player_hand[i].true == 11 && (valueofcards + player_hand[i].true) > 21){
            valueofcards += 1
        } else {
            valueofcards += player_hand[i].true
        }
    }
    cardval.innerHTML = valueofcards
}
function bust(){
    cardval.innerHTML += " BUSTED!!!!"
    againbtn.disabled = false
    hitbtn.disabled = true
    standbtn.disabled = true
    lose()
}
function blackjack(){
    stand(true)
}
function hit(){
    let temp = deck.pop()
    player_hand.push(temp)
    listhand()

    if (valueofcards > 21){
        bust()
    }
}
function win(blackjack){
    statusdiv.innerHTML = "WINNER!"
    if (blackjack){
        statusdiv.innerHTML = "BLACKJACK!"
    }
}
function lose(){
    statusdiv.innerHTML = "LOSER!"
}
function tie(){
    statusdiv.innerHTML = "TIE!"
}
function stand(blackjack){
    listhand(true)
    while (dealervalueofcards < 17){
        let temp = deck.pop()
        dealer_hand.push(temp)
        listhand(true)
    }
    againbtn.disabled = false
    hitbtn.disabled = true
    standbtn.disabled = true

    if (blackjack && dealervalueofcards != valueofcards){
        win(true)
    } else if (dealervalueofcards > 21 || valueofcards > dealervalueofcards){
        win()
    } else if (dealervalueofcards > valueofcards || valueofcards > 21) {
        lose()
    } else {
        tie()
    }
}
function init(){
    statusdiv.innerHTML = ""
    if(deck.length < 20){
        newdeck()
    }
    deal()
    listhand(false)
    console.log(dealer_hand, player_hand, deck.length)

    againbtn.disabled = true
    hitbtn.disabled = false
    standbtn.disabled = false

    if (valueofcards == 21){
        blackjack()
    }
}
init()

hitbtn.addEventListener("click", ()=>{
    hit()
})

standbtn.addEventListener("click", ()=>{
    stand(false)
})

againbtn.addEventListener("click", ()=>{
    init()
})
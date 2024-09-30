let deck = []
let dealer_hand = []
let player_hand = []
let player_hand_split = []

let money = 1000
let bet = 0

let valueofcards = 0
let valueofcards_ace11 = 0

const suits = ["&hearts;", "&diams;", "&spades;", "&clubs;"]
const truevalues = [1,2,3,4,5,6,7,8,9,10,10,10,10]
const displayvalues = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
const dealer_disp = document.getElementById("dealer")
const player_disp = document.getElementById("player")
const cardval = document.getElementById("cardval")
const hitbtn = document.getElementById("hit")
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
    for(let i=0; i<2; i++){
        let temp = deck.pop()
        dealer_hand.push(temp)
    }
    for(let i=0; i<2; i++){
        let temp = deck.pop()
        player_hand.push(temp)
    }
}
function listhand(){
    valueofcards = 0
    dealer_disp.innerHTML = ""
    player_disp.innerHTML = ""
    for(let i=0; i<dealer_hand.length; i++){
        let div = document.createElement("div")
        div.classList.add("card")
        if(i==0){
            div.classList.add("covered")
        } else {
            div.innerHTML=`${displayvalues[dealer_hand[i].val - 1]}${suits[player_hand[i].suit]}`
        }
        dealer_disp.appendChild(div)
    }

    for(let i=0; i<player_hand.length; i++){
        let div = document.createElement("div")
        div.classList.add("card")
        div.innerHTML=`${displayvalues[player_hand[i].val - 1]}${suits[player_hand[i].suit]}`
        player_disp.appendChild(div)
        valueofcards += player_hand[i].true
    }
    cardval.innerHTML = valueofcards
}
function hit(){
    let temp = deck.pop()
    player_hand.push(temp)
    listhand()
}
function init(){
    if(deck.length < 20){
        newdeck()
    }
    deal()
    listhand()
    console.log(dealer_hand, player_hand, deck.length)
}
init()

hitbtn.addEventListener("click", ()=>{
    hit()
})
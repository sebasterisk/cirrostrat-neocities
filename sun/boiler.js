const box = document.getElementById("box")
function boil(){
    let string = "polygon("
    string += (Math.random()*5) + "%"
    string += (Math.random()*5) + "%,"

    string += (100 - Math.random()*5) + "%"
    string += (Math.random()*5) + "%,"

    string += (100 - Math.random()*5) + "%"
    string += (100 - Math.random()*5) + "%,"

    string += (Math.random()*5) + "%"
    string += (100 - Math.random()*5) + "%)"

    box.style.clipPath = string
}

setInterval(boil, 750)
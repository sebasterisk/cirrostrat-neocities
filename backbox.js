const offset = 100
let tick = 0
setInterval(()=>{
    if (tick >= offset){tick = 0}
    document.querySelectorAll('.backbox')[0].style.setProperty("--offset", `${tick/2}px ${tick/2}px`);
    tick++            
}, 50)
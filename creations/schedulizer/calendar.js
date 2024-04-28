import ICAL from "https://unpkg.com/ical.js"
        
const fiContain = document.getElementById("ficontain")
const fileInput = document.getElementById("calinput")
const content = document.querySelector("#calcontent")
const prev = document.getElementById("prevdate")
const today = document.getElementById("resettoday")
const next = document.getElementById("nextdate")
const replace = document.getElementById("replace")
const calbuttons = document.getElementById("calbuttons")

let final
let parsed
let viewDate = new Date(new Date().setHours(0,0,0,0))

function parse(icaldata){
    parsed = ICAL.parse(icaldata)
    //console.log(parsed)
    feventson(viewDate)
}

function feventson(now){
    if (!parsed){
        console.error("no jcal to parse")
        return
    }

    let parser = new ICAL.ComponentParser()
    let towrite = "<b>" + new Date(now).toLocaleDateString("en-US",{"dateStyle":"full"}) + "</b><br><hr>"

    parser.onevent = (event) => {
        const s = event.startDate.toJSDate()
        const e = event.endDate.toJSDate()
        if ((now >= s) && (now < e)){
            towrite += `${event.summary}<br><span class="small">`
            if((e-s)<=(86400000)){
                towrite += `${s.toLocaleDateString()}<br>`
            } else {
                towrite += `${s.toLocaleDateString()} - ${e.toLocaleDateString()}<br>`
            }
            towrite += "</span><hr>"
        }
    }

    parser.oncomplete = () => {
        content.innerHTML = towrite
        towrite = ""
    }
    parser.process(parsed)
}

if(window.localStorage.getItem("calendar")){
    final = window.localStorage.getItem("calendar")
    fiContain.style.visibility = "hidden"
    fiContain.hidden = true
    parse(final)
} else {
    calbuttons.hidden = true
    content.hidden = true
}

function previewFile() {
    const [file] = calinput.files
    const reader = new FileReader()

    reader.addEventListener(
        "load",
        () => {
            fiContain.style.visibility = "hidden"
            fiContain.hidden = true
            calbuttons.hidden = false
            content.hidden = false
            final = reader.result
            window.localStorage.setItem("calendar", final)
            parse(final)
            location.reload()
        },
        false,
    );

    if (file && file.size <= 512000) {
        reader.readAsText(file);
    }
}

fileInput.onchange = previewFile

replace.onclick = () => {
    fiContain.hidden = false
    fiContain.style.visibility = "visible"
    calbuttons.hidden = true
    content.hidden = true
}

prev.onclick = () => {
    viewDate = new Date(viewDate).getTime() - 86400000
    feventson(new Date(viewDate))
}
next.onclick = () => {
    viewDate = new Date(viewDate).getTime() + 86400000
    feventson(new Date(viewDate))
}
today.onclick = () => {
    viewDate = new Date().setHours(0,0,0,0)
    feventson(new Date(viewDate))
}
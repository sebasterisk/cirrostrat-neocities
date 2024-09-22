const form = document.getElementById("inputform")

form.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    let things = Object.fromEntries(formData)
    let formatted = {
        "meta":{
            "uniqueperiods": 8,
            "periodsaretyped": true,
            "types":["humanities", "stem"]
        },
        "periods":[]
    }
    for(i=0; i<formatted.meta.uniqueperiods; i++){
        formatted.periods[i] = {
            "name":null,
            "type":null
        }
    }
    
    for(i in things){
        let current = Number(i.at(-1)-1)
        let prefix = i.substring(0,i.length-1)
        switch(prefix){
            case "periodtx":
                formatted.periods[current].name = things[i]
                break
            case "humsci":
                formatted.periods[current].type = things[i]
                break
            default:
                console.error(`couldn't determine resulting key from things index ${i}`)
        }
    }
    console.log(formatted)
    let string = JSON.stringify(formatted)
    let compressed = LZString.compressToEncodedURIComponent(string)

    const headto = new URL(window.location.origin + "/creations/schedulizer/landing.html")
    headto.searchParams.set("data", compressed)
    window.location.href = headto.toString()
})
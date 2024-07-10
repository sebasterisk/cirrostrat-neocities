const here = window.location.href,
      thisurl = new URL(here),
      params = thisurl.searchParams,
      id = params.get("id")

const title = document.getElementById("title")
const subtitle = document.getElementById("subtitle")
const author = document.getElementById("author")
const date = document.getElementById("timestamp")
const content = document.getElementById("articlecontent")

function fillarticlew(json){
    
    title.innerText = (json[id].title).toUpperCase()
    subtitle.innerHTML = json[id].sub
    author.innerHTML = json[id].author
    date.innerHTML = new Date(json[id].timestamp).toLocaleDateString("en-US")
    content.innerHTML = json[id].content
}
function getjson(){
    // gets json file 
    fetch('/sun/articledata.json')
        .then((response) => response.json())
        .then((json) => {fillarticlew(json)})
}
getjson()
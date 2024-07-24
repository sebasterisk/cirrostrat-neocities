const here = window.location.href,
      thisurl = new URL(here),
      params = thisurl.searchParams,
      data = params.get("page")

let page
if (!(data)){page = 0} else {page = data}
window.page = page
let perpage = 10
let jsondata

const template = document.getElementById("article_template")
const list = document.getElementById("articlelist")
const none = document.getElementById("noarticles")

function filllistw(json){
    if (page == -1){
        const lastpage = Math.ceil(json.length / perpage - 1)
        window.location.replace(`articlelist.html?page=${Number(lastpage)}`)
        return
    }

    const sorted = json.toReversed()
    for(let i = (perpage*page); i<(perpage*page + perpage); i++){
        if (!(sorted[i])){
            if(i == (perpage*page)){
                none.hidden = false
                window.location.replace(`articlelist.html?page=0`)
            }
            break
        }
        const clone = template.cloneNode(true)
        const entry = sorted[i]
        const cloneinsides = clone.children

        clone.removeAttribute("id")
        clone.dataset.articleid = (json.length - i-1)
        console.log(clone.dataset)

        for (let node of cloneinsides){
            if (node.classList.contains("article_title")){
                node.innerHTML = (entry.title).toUpperCase()
            } else if (node.classList.contains("article_sub")){
                node.innerHTML = entry.sub
            } else if (node.classList.contains("article_meta")){
                node.innerHTML = `${entry.author} &bull; ${new Date(entry.timestamp).toLocaleDateString()}`
            }
        }
        clone.style.backgroundImage = `linear-gradient(to right, #000000aa, #00000066), url(${entry.thumbnailimg})`
        list.appendChild(clone)
        clone.hidden = false
    }
}

function getjson(){
    // gets json file 
    fetch('/sun/articledata.json')
        .then((response) => response.json())
        .then((json) => {
            jsondata = json
            window.jsondata = jsondata
            filllistw(jsondata)
        })
}
getjson()

function articleredirect(element){
    const id = element.dataset.articleid
    window.location.replace(`article.html?id=${id}`)
}
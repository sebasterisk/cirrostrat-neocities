const template = document.getElementById("article_template")
const list = document.getElementById("articlelist")
function filllistw(json){
    const sorted = json.toReversed()
    for(let i=0; i<10; i++){
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

        list.appendChild(clone)
        clone.hidden = false
        
        if (!(sorted[i+1])){
            break
        }
    }
}

function getjson(){
    // gets json file 
    fetch('/sun/articledata.json')
        .then((response) => response.json())
        .then((json) => {filllistw(json)})
}
getjson()

function articleredirect(element){
    const id = element.dataset.articleid
    window.location.replace(`article.html?id=${id}`)
}
if (window.location.search == "") {
    console.error("no data in searchparams!")
    const errtext = document.getElementById("errors")
    errtext.innerHTML = "No data. Head to <a href='/creations/schedulizer/index.html'>home page</a> for setup.<br>"
}
//
const here = window.location.href,
      thisurl = new URL(here),
      params = thisurl.searchParams,
      data = params.get("data"),
      complete = JSON.parse(data)

let fetchres
let newcomplete = {}
let map_totable = []

let count
let timeline
//    
const type = document.getElementById("type")
const day = document.getElementById("day")
const selected = document.getElementById("selected")
const finaltable = document.getElementById("datatable")
const allnext = document.getElementById("allnext")
const finaltable_new = document.getElementById("datatable_new")
//
// lean mode banner elements
const leantime = document.getElementById("leantime")
const leanhead = document.getElementById("leanhead")
const leanmain = document.getElementById("leanmainmarquee")
const leanend = document.getElementById("leanend")
//
function timediff_mins(s,e){
    const start_time = new Date("1970-01-01T"+s+":00")
    const end_time = new Date("1970-01-01T"+e+":00")
    const day_len = (((end_time - start_time) / 1000)/60)
    return day_len
}
function pixelperminute(rangestart, rangeend){
    // pass strings formatted as "00:00", "23:00"
    const start_time = new Date("1970-01-01T"+rangestart+":00")
    const end_time = new Date("1970-01-01T"+rangeend+":00")
    const day_len = 500/(((end_time - start_time) / 1000)/60)
    return day_len
}
function filtercomplete(){
    let complete_keys = Object.keys(complete)
    let periods_fkeys = complete_keys.filter(v => v.startsWith("periodtx"))
    let ctype_fkeys = complete_keys.filter(v => v.startsWith("humsci"))
    
    for(i in periods_fkeys){
        const current_i = periods_fkeys[i]
        const current_v = complete[current_i]
        const corresp_ctype_i = ctype_fkeys[i]
        const corresp_ctype_v = complete[corresp_ctype_i]
        
        newcomplete[current_i] = {
            "name": current_v,
            "type": corresp_ctype_v
        }
    }
}
function getjson(){
    // gets json file 
    fetch('/creations/schedulizer/schedule.json')
        .then((response) => response.json())
        .then((json) => {fetchres = json})
}
function reset_days() {
    day.innerHTML = ""
    let keys = Object.keys( fetchres[type.value].attr.sets )

    for(i in keys){
        day.add(new Option(keys[i], keys[i]))
    }
    day.removeAttribute("hidden")
}
function update(){
    // handles dropdown menus
    let typeval = type.value
    let dayval = day.value

    map(typeval, dayval)
}
function map(map_type, map_day){
    const map_look = fetchres[map_type] // schedule type (json file)
    const map_set = map_look.attr.sets[map_day]  // period selectors
    const map_shifts = map_look.attr.hsdiff
    map_totable = [] 

    const start = map_look.attr.range[0]
    const end = map_look.attr.range[1]
    const pd_len = map_look.attr.len
    const ppm = pixelperminute(start, end)

    // period selection iteration
    //console.clear()
    for(i in map_set){
        const current = Number(i) + 1
        const v = map_set[i]
        const selectedperiod = newcomplete["periodtx"+v]
        const shift = map_shifts.includes(current)
        let starttime
        let starttime_px

        if (shift){
            starttime = map_look.times[String(current)][selectedperiod.type]
        } else {
            starttime = map_look.times[String(current)]
        }

        starttime_px = Number(ppm * timediff_mins(start, starttime))
        len_px = Number(ppm * pd_len)
        map_totable[current-1] = { 
            "name": selectedperiod.name,
            "time": new Date("1970-01-01T"+starttime+":00"),
            "len": pd_len,
            "table_offset": starttime_px,
            "table_len": len_px
        }        
    }

    if (Object.hasOwn(map_look.attr, "fixed")){
        let fixed = map_look.attr.fixed
        for (i in fixed){
            map_totable.push({ 
                "name": fixed[i].name,
                "time": new Date("1970-01-01T"+fixed[i].time+":00"),
                "len": fixed[i].len,
                "table_offset": Number(ppm * timediff_mins(start, fixed[i].time)),
                "table_len": Number(ppm * fixed[i].len),
                "fixed": true
            })      
        }
    } 
    
    map_totable.sort((a,b) => a.time - b.time)
    console.log(map_totable)

    finaltable_new.innerHTML = ""
    for (i in map_totable){
        // new table iteration (fancier with divs)
        let nowbox = document.createElement('div')
        nowbox.innerHTML = `<span class="starttime">${map_totable[i].time.toLocaleTimeString("en-US",{"timeStyle":"short"})}</span><br><span class="cname">${map_totable[i].name}</span>`
        nowbox.classList.add("scheduleelement")
        nowbox.style.top = map_totable[i].table_offset + "px"
        nowbox.style.height = map_totable[i].table_len + "px"
        if (map_totable[i].name == "free"){
            nowbox.style.visibility = "hidden"
        }
        if (map_totable[i].fixed){
            nowbox.classList.add("specialpd")
        }
        finaltable_new.appendChild(nowbox)
    }

    let hr = document.createElement("hr")
    hr.id = "timeline"
    finaltable_new.appendChild(hr)

    startcount()
    timelinetick(start, end)
}
function startcount(){
    if (count){
        clearInterval(count)
    }
    let tick = 0
    count = setInterval(() => {
        const timenow = new Date()
        let next, next_time, now, now_time, now_endtime
        let towrite = ""

        // calculate which period we're on
        for (i in map_totable){
            const v = map_totable[i]
            const v_today = new Date().setHours(v.time.getHours(), v.time.getMinutes(), v.time.getSeconds())
            let prev_v, prev_v_today, prev_v_endtime

            if (i>0) { // checks if there is preceding period
                prev_v = map_totable[i-1]
                prev_v_today = new Date().setHours(prev_v.time.getHours(), prev_v.time.getMinutes(), prev_v.time.getSeconds())
                prev_v_endtime = prev_v_today + (prev_v.len * 60000)
            }

            if (v_today > timenow){ 
                // checks if current period checked is after current time
                // if so, that is our next period, and preceding period is now
                next = v
                next_time = v_today

                if (prev_v){ 
                    now = prev_v
                    now_time = prev_v_today
                    now_endtime = new Date(prev_v_endtime)
                }

                break
            } else if (i == map_totable.length - 1) {
                if (prev_v){ 
                    now = v
                    now_time = v_today
                    now_endtime = new Date(v_today + (v.len * 60000))
                }
                continue
            } else {
                continue
            }
        }

        // calculate times to end, next
        if (!next){
            if ((now) && !(timenow > now_endtime)){
                const nowdiff = now_endtime - timenow
                const nowdiff_sec = (nowdiff / 1000)
                const nowdiff_min = Math.floor(nowdiff_sec / 60)
                const nowdiff_secleft = ("0" + Math.round(nowdiff_sec % 60)).slice(-2)
                const nowdiff_string = `${nowdiff_min}:${nowdiff_secleft}`

                towrite += `now: ${now.name} &mdash; ends at: ${now_endtime.toLocaleTimeString("en-US", {"timeStyle":"short"})} &mdash; ${nowdiff_string} from now<br>next up: `
                if (tick <= 50){
                    bannerwrite("now", now.name, "in "+  nowdiff_string  )
                } else if (tick <= 100){
                    bannerwrite("now", now.name, "at "+  now_endtime.toLocaleTimeString("en-US", {"timeStyle":"short"})  )
                } else {
                    bannerwrite("next", "end of day", "")
                }
            } else {
                bannerwrite("next", "end of day", "")
            }

            towrite += "end of day"
        } else {
            const diff = next_time - timenow
            const diff_sec = (diff / 1000)
            const diff_min = Math.floor(diff_sec / 60)
            const diff_secleft = ("0" + Math.round(diff_sec % 60)).slice(-2)
            const diff_string = `${diff_min}:${diff_secleft}`
            
            if ((now) && (timenow > now_endtime)){
                towrite += `betwixt periods<br>`
                towrite += `next up: ${next.name} in ${diff_string}`

                if (tick <= 100){
                    bannerwrite("now", "betwixt periods", "" )
                } else if (tick <= 150) {
                    bannerwrite("next", next.name, "in "+ diff_string)
                } else {
                    bannerwrite("next", next.name, "at "+ new Date(next_time).toLocaleTimeString("en-US", {"timeStyle":"short"}))
                }
            } else if (now){
                const nowdiff = now_endtime - timenow
                const nowdiff_sec = (nowdiff / 1000)
                const nowdiff_min = Math.floor(nowdiff_sec / 60)
                const nowdiff_secleft = ("0" + Math.round(nowdiff_sec % 60)).slice(-2)
                const nowdiff_string = `${nowdiff_min}:${nowdiff_secleft}`

                const betweentime = Math.floor((next_time - now_endtime)/60000)
                towrite += `now: ${now.name} &mdash; ends at: ${now_endtime.toLocaleTimeString("en-US", {"timeStyle":"short"})} &mdash; ${nowdiff_string} from now<br>`
                towrite += `next up: ${next.name} at ${new Date(next_time).toLocaleTimeString("en-US", {"timeStyle":"short"})} &mdash; ${betweentime} mins after`
            
                if (tick <= 50){
                    bannerwrite("now", now.name, "ends in "+  nowdiff_string  )
                } else if (tick <= 100){
                    bannerwrite("now", now.name, "ends "+ new Date(now_endtime).toLocaleTimeString("en-US", {"timeStyle":"short"}) )
                } else if (tick <= 150) {
                    bannerwrite("next", next.name, "in "+ diff_string)
                } else {
                    bannerwrite("next", next.name, "at "+ new Date(next_time).toLocaleTimeString("en-US", {"timeStyle":"short"}))
                }
            } else { // if not, show this
                towrite += `starting soon... <br>`
                towrite += `next up: ${next.name} in ${diff_string}`

                if (tick <= 100){
                    bannerwrite("now", "starting soon...", "" )
                } else if (tick <= 150) {
                    bannerwrite("next", next.name, "in "+ diff_string)
                } else {
                    bannerwrite("next", next.name, "at "+ new Date(next_time).toLocaleTimeString("en-US", {"timeStyle":"short"}))
                }
            }
        }

        tick++
        if (tick > 200){
            tick = 0
        }
        allnext.innerHTML = towrite
    },100)
}

function bannerwrite(head, main, end){
    leanhead.innerHTML = head
    leanmain.innerHTML = main
    leanend.innerHTML = end
}

function timelinetick(startbound, endbound){
    if (timeline){
        clearInterval(timeline)
    }
    
    timeline = setInterval(() => {
        const hr = document.getElementById("timeline")
        const ppm = pixelperminute(startbound, endbound)
        const now = new Date().toLocaleTimeString("en-US",{"timeStyle":"short", "hourCycle":"h24"})
        const set = ppm * timediff_mins(startbound, now)
        if (set <= 0 || set >= 500){
            hr.style.visibility = "hidden"
        } else {
            hr.style.visibility = "visible"
        }
        hr.style.top = set + "px"
    }, 100)
}

filtercomplete()
getjson()
type.onchange = function(){
    reset_days()
    update()
}
day.onchange = update
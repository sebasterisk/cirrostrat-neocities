// it works 
let fetchres
let newcomplete = {}
let map_totable = []

let count
let timeline

// document constants 
const type = document.getElementById("type")
const day = document.getElementById("day")
const finaltable_new = document.getElementById("datatable_new")

const leanhead = document.getElementById("leanhead")
const leanmain = document.getElementById("leanmainmarquee")
const leanend = document.getElementById("leanend")

const stathead = document.getElementById("stathead")
const statmain = document.getElementById("statmain")
const statend = document.getElementById("statend")
const statbar = document.getElementById("progress")

// url parameters
let here, thisurl, params, data, complete

// json schema validator
const Ajv = window.ajv7
const ajv = new Ajv()
const tt_schema = {
    "title": "timetable",
    "type": "object",
    "properties":{
        "meta":{
            "type": "object",
            "properties": {
                "name":{
                    "type":"string"
                },
                "uniqueperiods":{
                    "type":"number"
                },
                "periodsaretyped":{
                    "type":"boolean"
                },
                "types":{
                    "type":"array",
                    "items":{
                        "type": "string"
                    }
                }
            },
            "required":["name","uniqueperiods","periodsaretyped","types"]
        },
        "profiles":{
            "type": "array",
            "items":{
                "type": "object",
                "properties":{
                    "attr":{
                        "type":"object",
                        "properties":{
                            "name":{
                                "type":"string"
                            },
                            "len":{
                                "type":"number"
                            },
                            "range":{
                                "type":"number"
                            },
                            "typediff":{
                                "type":"array",
                                "items":{
                                    "type": "number"
                                }
                            },
                            "bounds":{
                                "type":"array",
                                "items":{
                                    "type": "string"
                                }
                            },
                            "sets":{
                                "type":"object"
                            }
                        },
                        "required":["name","len","range","typediff","bounds","sets"]
                    },
                    "times":{
                        "type":"array"
                    },
                    "fixed":{
                        "type":"array"
                    },
                },
                "required":["attr","times"]
            }
        }
    },
    "required":["meta","profiles"]
}
const validatett = ajv.compile(tt_schema)

const pd_schema = {
    "title":"classlist",
    "type":"object",
    "properties":{
        "meta":{
            "type": "object",
            "properties": {
                "name":{
                    "type":"string"
                },
                "uniqueperiods":{
                    "type":"number"
                },
                "periodsaretyped":{
                    "type":"boolean"
                },
                "types":{
                    "type":"array",
                    "items":{
                        "type": "string"
                    }
                }
            },
            "required":["uniqueperiods","periodsaretyped","types"]
        },
        "periods":{
            "type": "array",
            "items":{
                "type":"object",
                "properties":{
                    "name":{
                        "type": "string"
                    },
                    "type":{
                        "type": "string"
                    }
                },
                "required":["name", "type"]
            }
        }
    },
    "required":["meta","periods"]
}
const validatepd = ajv.compile(pd_schema)

// check for data
if (window.location.search == "") {
    console.error("no data in searchparams!")
    const errtext = document.getElementById("errors")
    errtext.innerHTML = "no schedule in save. check your url, or select &quot;edit&quot; to begin.<br>NOTE: the old system of raw text url params have been replaced with a 64 bit string. if you had that url saved, you will need to setup again!"
} else {
    here = window.location.href
    thisurl = new URL(here)
    params = thisurl.searchParams
    data = params.get("data")
    let decomp = LZString.decompressFromEncodedURIComponent(data)
    // probably NOT the best way of doing this
    decomp = decomp.replace(/\\n/g, '')
    decomp = decomp.replace(/\\/g, '')
    decomp = decomp.replace(/^"/, '')
    decomp = decomp.replace(/"$/, '')
    try {
        complete = JSON.parse(decomp)
        chatisthisvalid(complete, "pd")
        console.log(complete)
    } catch {
        cry("class list JSON was unable to be parsed... try setup again")
    }
    
    filtercomplete()
    getjson()

    type.onchange = function(){
        reset_days()
        update()
    }
    day.onchange = update

    window.addEventListener("resize", () => {
        update()
    })
}

// functions!
function cry(about){
    document.getElementById("errors").innerHTML += about + "<br>"
}
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
    const day_len = finaltable_new.offsetHeight /(((end_time - start_time) / 1000)/60)
    return day_len
}
function filtercomplete(){
    for(i in complete.periods){
        console.log(i)
        newcomplete[i] = {
            "name": complete.periods[i].name,
            "type": complete.periods[i].type
        }
    }
    console.log(newcomplete)
}
function chatisthisvalid(x, type){
    let validity
    switch (type){
        case "tt":
            validity = validatett(x)
            console.log("timetable valid " + validity)
            if (!validity){
                cry("JSON timetabe list does not match schema. The current timetable may be invalid! <br> This was the offense: " + validatett.errors[0].message)
            }
            break
        case "pd":
            validity = validatepd(x)
            console.log("class list valid " + validity)
            if (!validity){
                cry("JSON class list does not match schema. The current class list may be invalid! <br> This was the offense: " + validatepd.errors[0].message)
            }
            break
    }
}
function getjson(){
    // gets json file
    if(window.localStorage.getItem("sked")){
        fetchres = JSON.parse(window.localStorage.getItem("sked"))
        // handle bad JSON here
        listprofiles()
        chatisthisvalid(fetchres,"tt")
        console.log("using custom schedule " + fetchres.meta.name)
        document.getElementById("skedmsg").innerHTML = `current: ${fetchres.meta.name}`
    } else {
        fetch('/creations/schedulizer/schedule.json')
        .then((response) => response.json())
        .then((json) => {
            fetchres = json
            listprofiles()
            chatisthisvalid(fetchres,"tt")
        })
        console.log("not using save")
        chatisthisvalid(fetchres)
        document.getElementById("skedmsg").innerHTML = `no custom time order yet`
    }
}
function listprofiles(){
    for(let i in fetchres.profiles){
        let profile = document.createElement("option")
        profile.innerHTML = fetchres.profiles[i].attr.name
        profile.value = fetchres.profiles[i].attr.name
        type.appendChild(profile)
    }
}
function reset_days() {
    day.innerHTML = ""
    let keys = Object.keys(fetchres.profiles.find(p => p.attr.name == type.value).attr.sets)

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
    // this function forms and renders the schedule
    // for the specified type and day

    const map_look = fetchres.profiles.find(p => p.attr.name == map_type) // schedule type (json file)
    const map_set = map_look.attr.sets[map_day]  // period selectors
    const map_shifts = map_look.attr.typediff
    map_totable = [] 

    const start = map_look.attr.bounds[0]
    const end = map_look.attr.bounds[1]
    const ppm = pixelperminute(start, end)

    // period selection iteration
    for(i in map_set){
        const current = Number(i) + 1
        const v = map_set[i]
        const selectedperiod = newcomplete[v-1]
        const shift = map_shifts.includes(current)
        let pd_len = map_look.attr.len
        if (map_look.attr.lenoverride && map_look.attr.lenoverride.find(e => e.for == current)){
            pd_len = map_look.attr.lenoverride.find(e => e.for == current).to
        }
        let starttime
        let starttime_px
        
        if (shift){
            starttime = map_look.times[i][selectedperiod.type]
        } else {
            starttime = map_look.times[i]
        }
        
        starttime_px = Number(ppm * timediff_mins(start, starttime))
        len_px = Number(ppm * pd_len)
        map_totable[current-1] = { 
            "name": selectedperiod.name,
            "time": new Date("1970-01-01T"+starttime+":00"),
            "len": pd_len,
            "table_offset": starttime_px,
            "table_len": len_px,
            "fixed": false
        }   
    }

    if (map_look.fixed && map_look.fixed[0]){
        let fixed = map_look.fixed
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
        setmarq()
        const timenow = new Date()
        let next, next_time, now, now_endtime

        // iterates over each period
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
            } else if (i == map_totable.length - 1) { // last period
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

        if (!next){ // ran at final period
            if ((now) && !(timenow > now_endtime)){
                const nowdiff = now_endtime - timenow
                const nowdiff_sec = (nowdiff / 1000)
                const nowdiff_min = Math.floor(nowdiff_sec / 60)
                const nowdiff_secleft = ("0" + Math.round(nowdiff_sec % 60)).slice(-2)
                const nowdiff_string = `${nowdiff_min}:${nowdiff_secleft}`

                if (tick <= 50){
                    bannerwrite("now", now.name, "ends in "+  nowdiff_string  )
                } else if (tick <= 100){
                    bannerwrite("now", now.name, "ends "+  now_endtime.toLocaleTimeString("en-US", {"timeStyle":"short"})  )
                } else {
                    bannerwrite("next", "end of day", "")
                }
            } else { // end of day
                bannerwrite("next", "end of day", "")
            }

        } else { // ran during the day
            const diff = next_time - timenow
            const diff_sec = (diff / 1000)
            const diff_min = Math.floor(diff_sec / 60)
            const diff_secleft = ("0" + Math.round(diff_sec % 60)).slice(-2)
            const diff_string = `${diff_min}:${diff_secleft}`
            
            if ((now) && (timenow > now_endtime)){ // in between periods
                if (tick <= 100){
                    bannerwrite("now", "in between periods", "" )
                } else if (tick <= 150) {
                    bannerwrite("next", next.name, "in "+ diff_string)
                } else {
                    bannerwrite("next", next.name, "at "+ new Date(next_time).toLocaleTimeString("en-US", {"timeStyle":"short"}))
                }
            } else if (now){ // during period
                const nowdiff = now_endtime - timenow
                const nowdiff_sec = (nowdiff / 1000)
                const nowdiff_min = Math.floor(nowdiff_sec / 60)
                const nowdiff_secleft = ("0" + Math.round(nowdiff_sec % 60)).slice(-2)
                const nowdiff_string = `${nowdiff_min}:${nowdiff_secleft}`
            
                if (tick <= 50){
                    bannerwrite("now", now.name, "ends in "+  nowdiff_string  )
                } else if (tick <= 100){
                    bannerwrite("now", now.name, "ends "+ new Date(now_endtime).toLocaleTimeString("en-US", {"timeStyle":"short"}) )
                } else if (tick <= 150) {
                    bannerwrite("next", next.name, "in "+ diff_string)
                } else {
                    bannerwrite("next", next.name, "at "+ new Date(next_time).toLocaleTimeString("en-US", {"timeStyle":"short"}))
                }
            } else { // ran before first period
                if (tick <= 100){
                    bannerwrite("now", "starting soon...", "" )
                } else if (tick <= 150) {
                    bannerwrite("next", next.name, "in "+ diff_string)
                } else {
                    bannerwrite("next", next.name, "at "+ new Date(next_time).toLocaleTimeString("en-US", {"timeStyle":"short"}))
                }
            }
        }

        tick++ // runs a tick every 0.1 seconds, status changes every 5
        if (tick > 200){
            tick = 0
        }
        //allnext.innerHTML = towrite
    },100)
}
function bannerwrite(head, main, end){
    leanhead.innerHTML = head
    stathead.innerHTML = head
    leanmain.innerHTML = main
    statmain.innerHTML = main
    leanend.innerHTML = end
    statend.innerHTML = end
}
function timelinetick(startbound, endbound){
    if (timeline){
        clearInterval(timeline)
    }
    
    timeline = setInterval(() => {
        const hr = document.getElementById("timeline")
        const ppm = pixelperminute(startbound, endbound)
        const now = new Date().toLocaleTimeString("en-US",{"timeStyle":"short", "hourCycle":"h23"})
        const set = ppm * timediff_mins(startbound, now)
        if (set <= 0 || set >= finaltable_new.offsetHeight){
            hr.style.visibility = "hidden"
            hr.style.display = "none"
            hr.visibility = false
        } else {
            hr.style.visibility = "visible"
            hr.style.display = "block"
            hr.visibility = true
        }
        hr.style.top = set + "px"
    }, 100)
}
function setmarq(){
    if(statmain.scrollWidth > document.getElementById("statmainw").offsetWidth){
        statmain.classList.add("marquee")
    }else{
        statmain.classList.remove("marquee")
    }
}
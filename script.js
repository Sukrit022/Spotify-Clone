let currsong=new Audio();
let songs;
let currfolder;

async function getsongs(folder) {
    currfolder=folder
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songul= document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML=""
    
    for (const song of songs) {
        
        let indsong=song.replaceAll("%20"," ").split("-")[1].trim();
        let artist=song.replaceAll("%20"," ").split("-")[0].trim();
        
        songul.innerHTML+=`<li>
                            <img src="svgs/music.svg" alt="" class="invert">
                            <div class="info">
                                <div class="songname">${indsong.substr(0,indsong.length-4)}</div>
                                <div>${artist}</div>
                            </div>
                            <div class="playnow">
                                <img src="svgs/play.svg" alt="" class="invert">
                            </div>
                        </li>`
    
    }

    //Attaching event listener to each song

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",(element) => {
            let am=e.querySelector(".info").lastElementChild.innerHTML.trim() + " - " + e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3"
            playMusic(am);
        })
    })

    return songs

}

function formatTime(seconds) {

    if(isNaN(seconds) || seconds<0){
        return "00:00"
    }
    // Round seconds to the nearest whole number
    const roundedSeconds = Math.round(seconds);
  
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
  
    // Pad with leading zeros if necessary
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = remainingSeconds.toString().padStart(2, '0');
  
    // Combine into mm:ss format
    return `${minutesStr}:${secondsStr}`;
  }
  

const playMusic=(track,pause=false) => {

    currsong.src=`/songs/${currfolder}/`+track
    if(!pause){
        currsong.play()
        play.src="svgs/pause.svg"
    }
    

    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00.00 / 00.00"

}

async function main() {

    // Attaching event listener to play

    play.addEventListener("click",() => {
        if(currsong.paused){
            currsong.play()
            play.src="svgs/pause.svg"
        }
        else{
            currsong.pause()
            play.src="svgs/play.svg"
        }
    })

    document.addEventListener("keydown", e => {
        if (e.code === "Space") {
            e.preventDefault();  // Prevent default action like scrolling the page
            if(currsong.paused){
                currsong.play()
                play.src="svgs/pause.svg"
            }
            else{
                currsong.pause()
                play.src="svgs/play.svg"
            }
        }
    });
    

    // Time Update

    currsong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${formatTime(currsong.currentTime)} / ${formatTime(currsong.duration)}`
        document.querySelector(".circle").style.left =(currsong.currentTime/ currsong.duration * 100) +"%"
    })

    // Event listener for seekbar

    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width  * 100)
        document.querySelector(".circle").style.left = percent +"%"
        currsong.currentTime = (percent * currsong.duration) /100
    })

    // Event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",e=>{
        document.querySelector(".left").style.left="0";
    })

    // Event Listener for cross
    
    document.querySelector(".close").addEventListener("click",e=>{
        document.querySelector(".left").style.left= "-100%";
    })

    /// Event Listener for prev and next

    prev.addEventListener("click",e=>{
        let find=currsong.src.split('/').slice(-1)[0]
        let index=songs.indexOf(find);
        let prevsong;
        if(index==0){
            prevsong=songs.slice(-1)[0];
        }
        else{
            prevsong=songs[index-1];
        }
        playMusic(prevsong);
    })

    next.addEventListener("click", e => {
        let find = currsong.src.split('/').slice(-1)[0];
        let index = songs.indexOf(find);
        let nextsong;
        
        if (index == songs.length - 1) {
            nextsong = songs[0];
        } else {
            nextsong = songs[index + 1];
        }
        
        playMusic(nextsong);
    });
    
    currsong.addEventListener("ended", () => {
        next.click();
    });
    
    // Event listener for volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currsong.volume=parseInt(e.target.value)/100;
        if(currsong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svgs/mute.svg","svgs/volume.svg");
        }
    })

    //Event listener for folders

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs=await getsongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })

    //Event listener to mute volume

    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("svgs/volume.svg")){
            e.target.src = e.target.src.replace("svgs/volume.svg","svgs/mute.svg");
            currsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src = e.target.src.replace("svgs/mute.svg","svgs/volume.svg");
            currsong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
    })

}


main()

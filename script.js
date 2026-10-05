const API = "/api/schedule";
const WA_NUMBER = "923025122000";

const dateInput = document.getElementById("scheduleDate");
const dayTitle = document.getElementById("scheduleDay");
const slotsBox = document.getElementById("scheduleSlots");
const formCard = document.getElementById("bookingFormCard");
const selectedSlotBox = document.getElementById("selectedSlot");

const fallbackSchedule = {
    Sunday: [["17:00","19:00","Booked","Zain"],["19:00","21:00","Booked","Veer G"],["21:00","23:00","Booked","Husnain"],["23:00","00:00","Available",""],["00:00","02:00","Available",""]],
    Monday: [["06:00","08:00","Available",""],["16:00","17:00","Available",""],["17:00","18:00","Available",""],["18:00","20:00","Available",""],["20:00","21:00","Available",""],["21:00","22:00","Available",""],["22:00","00:00","Available",""],["00:00","02:00","Available",""]],
    Tuesday: [["16:00","17:00","Available",""],["17:00","18:00","Available",""],["18:00","19:00","Available",""],["19:00","20:00","Available",""],["20:00","22:00","Available",""],["22:00","23:00","Available",""],["23:00","00:00","Available",""],["00:00","02:00","Available",""]],
    Wednesday: [["16:00","17:00","Available",""],["17:00","18:00","Available",""],["18:00","20:00","Available",""],["20:00","22:00","Available",""],["22:00","00:00","Available",""],["23:00","00:00","Available",""],["00:00","02:00","Available",""]],
    Thursday: [["16:00","17:00","Available",""],["17:00","18:00","Available",""],["18:00","19:00","Available",""],["19:00","20:00","Available",""],["21:00","22:30","Booked","Sohaib Aslam"],["22:30","00:30","Booked","Bajwa Collection"],["00:30","02:00","Available",""]],
    Friday: [["16:00","17:00","Available",""],["17:00","18:00","Available",""],["18:00","19:00","Available",""],["19:00","21:00","Available",""],["21:00","23:00","Booked","Hussain"],["23:00","00:00","Available",""],["00:00","02:00","Available",""]],
    Saturday: [["16:00","17:00","Available",""],["17:00","18:00","Available",""],["18:00","19:00","Available",""],["19:00","20:00","Available",""],["20:00","21:00","Available",""],["21:00","22:00","Available",""],["22:00","23:00","Available",""],["23:00","00:00","Available",""],["00:00","02:00","Available",""]]
};

function todayISO(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
dateInput.value=todayISO();
document.getElementById("date").value=dateInput.value;

function displayTime(t){
    const [h,m]=t.split(":").map(Number);
    const suffix=h>=12?"PM":"AM";
    const hour=h%12||12;
    return `${hour}:${String(m).padStart(2,"0")} ${suffix}`;
}
function showToast(message){
    const el=document.getElementById("toast");
    el.textContent=message;el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"),2800);
}
function escapeHTML(s){
    return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function showPage(id){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(id)?.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
    if(id==="bookingPage") loadSchedule();
}
function resetSelected(){
    selectedSlotBox.classList.remove("active");
    selectedSlotBox.innerHTML="<span>SELECT AN AVAILABLE TIME ABOVE</span>";
    formCard.classList.remove("ready");
    document.getElementById("fromTime").value="";
    document.getElementById("toTime").value="";
}
function selectSlot(start,end,status){
    if(String(status).toLowerCase()==="booked"){
        showToast("Sorry, this time is already booked.");
        return;
    }
    document.getElementById("fromTime").value=start;
    document.getElementById("toTime").value=end;
    document.getElementById("date").value=dateInput.value;
    selectedSlotBox.classList.add("active");
    selectedSlotBox.textContent=`✓ SELECTED: ${displayTime(start)} – ${displayTime(end)}`;
    formCard.classList.add("ready");
    formCard.scrollIntoView({behavior:"smooth",block:"center"});
}
async function loadSchedule(){
    const date=dateInput.value;
    if(!date)return;
    resetSelected();

    const d=new Date(date+"T12:00:00");
    const day=d.toLocaleDateString("en-US",{weekday:"long"});
    dayTitle.textContent=day;
    slotsBox.innerHTML='<div class="loading-box">Loading latest schedule...</div>';

    let data;
    try{
        const res=await fetch(`${API}?date=${encodeURIComponent(date)}&_=${Date.now()}`,{cache:"no-store"});
        if(!res.ok)throw new Error();
        data=await res.json();
        // Never display data belonging to another date.
        if(String(data.date||"") !== String(date)) throw new Error("Date mismatch");
    }catch(e){
        data={date,day,slots:[]};
    }

    const slots=Array.isArray(data.slots)?data.slots:[];
    if(!slots.length){
        slotsBox.innerHTML='<div class="loading-box">No schedule has been published for this date yet.</div>';
        return;
    }

    slotsBox.innerHTML="";
    slots.forEach(([start,end,status,name])=>{
        const booked=String(status).toLowerCase()==="booked";
        const el=document.createElement("div");
        el.className=`slot ${booked?"booked":"available"}`;
        el.innerHTML=`
            <div class="slot-time">${displayTime(start)} – ${displayTime(end)}</div>
            <div class="slot-status">${booked?"🔴 BOOKED":"🟢 AVAILABLE"}</div>
            ${booked&&name?`<div class="booked-by">Booked by: ${escapeHTML(name)}</div>`:""}
        `;
        el.onclick=()=>selectSlot(start,end,status);
        slotsBox.appendChild(el);
    });
}
function sendBooking(){
    const name=document.getElementById("name").value.trim();
    const phone=document.getElementById("phone").value.trim();
    const sport=document.getElementById("sport").value;
    const date=document.getElementById("date").value;
    const from=document.getElementById("fromTime").value;
    const to=document.getElementById("toTime").value;
    const players=document.getElementById("players").value.trim();
    const message=document.getElementById("message").value.trim();

    if(!from||!to){showToast("Please select an available time first.");return;}
    if(!name){showToast("Please enter your full name.");return;}
    if(!phone){showToast("Please enter your phone number.");return;}
    if(!sport){showToast("Please select a sport.");return;}
    if(!players){showToast("Please enter the number of players.");return;}

    const formattedDate=new Date(date+"T12:00:00").toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"});
    let text=`*PITCH&BREW SLOT BOOKING*

Name: ${name}
Phone: ${phone}
Sport: ${sport}
Date: ${formattedDate}
Time: ${displayTime(from)} to ${displayTime(to)}
Players: ${players}`;

    if(message)text+=`\nAdditional Message: ${message}`;
    text+=`\n\nThank you.\nPITCH&BREW\nMulti Sports Arena`;

    window.location.href=`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
dateInput.addEventListener("change",loadSchedule);

window.addEventListener("load",()=>{
    setTimeout(()=>document.getElementById("splashScreen")?.remove(),5100);
    loadSchedule();
});

"use strict";
const $=id=>document.getElementById(id);
const STORE="civicsathi_final_v1";
let coords={lat:null,lng:null};

const KEYWORDS={
 "Pothole / Road Damage":["pothole","potholes","gadda","gaddha","road damage","broken road","road kharab","sadak kharab","sadak toot","crater"],
 "Garbage / Waste":["garbage","kachra","kachre","waste","dump","dumped","litter","rubbish","dustbin","kachra pada"],
 "Streetlight":["streetlight","street light","street-light","lamp","light not working","light kharab","road light","bijli ki light"],
 "Waterlogging / Drainage":["waterlogging","water logging","flood","drainage","drain","paani bhar","pani bhar","sewer","sewage","naali","nali"],
 "Broken Footpath":["footpath","foot path","sidewalk","pavement","patri toot"],
 "Fallen Tree":["fallen tree","tree fallen","ped gir","tree down","branch fell"],
 "Traffic / Road Obstruction":["traffic jam","traffic","jam","obstruction","blocked road","road blocked","encroachment"]
};
const DEPT={
 "Pothole / Road Damage":"Roads / Public Works",
 "Garbage / Waste":"Municipal Sanitation",
 "Streetlight":"Electrical / Street Lighting",
 "Waterlogging / Drainage":"Drainage / Water Department",
 "Broken Footpath":"Roads / Public Works",
 "Fallen Tree":"Municipal Emergency / Parks",
 "Traffic / Road Obstruction":"Traffic / Municipal Enforcement",
 "Other Civic Issue":"Municipal Help Desk"
};
const HIGH=["accident","danger","dangerous","injury","school","hospital","blocked","emergency","flood","major","huge","very big","bahut bada","khatarnak","accident ho sakta","life risk"];
const ONGOING=["day","days","din","week","weeks","recurring","again","5 din","3 din","many days","months"];

document.querySelectorAll(".quick button").forEach(b=>b.onclick=()=>{$("complaint").value=b.dataset.text;$("complaint").focus()});

$("photo").addEventListener("change",()=>{
 const f=$("photo").files[0];
 if(!f){$("preview").style.display="none";return}
 const reader=new FileReader();
 reader.onload=e=>{$("preview").src=e.target.result;$("preview").style.display="block"};
 reader.readAsDataURL(f);
});

$("locationBtn").onclick=()=>{
 if(!navigator.geolocation){$("location").textContent="Geolocation is not supported.";return}
 $("location").textContent="Detecting location…";
 navigator.geolocation.getCurrentPosition(
  p=>{coords={lat:p.coords.latitude,lng:p.coords.longitude};$("location").textContent=`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;toast("Location added ✓")},
  ()=>{$("location").textContent="Permission denied / unavailable."}
 );
};

function classify(text){
 let best="Other Civic Issue",bestScore=0;
 for(const [cat,words] of Object.entries(KEYWORDS)){
  const score=words.reduce((n,w)=>n+(text.includes(w)?1:0),0);
  if(score>bestScore){bestScore=score;best=cat}
 }
 return {category:best,confidence:bestScore?Math.min(.96,.66+bestScore*.1):.48};
}
function calculatePriority(text,category,hasPhoto){
 let score=30,reasons=[];
 if(["Pothole / Road Damage","Waterlogging / Drainage","Traffic / Road Obstruction"].includes(category)){
  score+=18;reasons.push("This issue can affect public movement or road safety.");
 }
 const h=HIGH.filter(w=>text.includes(w));
 if(h.length){score+=Math.min(38,h.length*11);reasons.push("Safety or public-impact language was detected.");}
 const o=ONGOING.filter(w=>text.includes(w));
 if(o.length){score+=10;reasons.push("The complaint indicates an ongoing or recurring problem.");}
 if(hasPhoto){score+=4;reasons.push("Photo evidence was attached to strengthen the report.");}
 score=Math.min(100,score);
 const level=score>=75?"HIGH":score>=50?"MEDIUM":"LOW";
 if(!reasons.length)reasons.push("Priority was estimated from the issue type and the information supplied.");
 return {score,level,reasons};
}
function reports(){try{return JSON.parse(localStorage.getItem(STORE)||"[]")}catch{return[]}}
function save(rs){localStorage.setItem(STORE,JSON.stringify(rs))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}

function resetAgents(){
 document.querySelectorAll(".agent").forEach((a,i)=>{a.className="agent";a.querySelector("span").textContent=i===0?"Waiting for citizen input":"Waiting"});
}
async function animateAgents(){
 resetAgents();
 const all=[...document.querySelectorAll(".agent")];
 for(let i=0;i<all.length;i++){
  if(i){all[i-1].classList.remove("active");all[i-1].classList.add("done");all[i-1].querySelector("span").textContent="Completed ✓"}
  all[i].classList.add("active");all[i].querySelector("span").textContent="Processing…";
  await new Promise(r=>setTimeout(r,320));
 }
 all.at(-1).classList.remove("active");all.at(-1).classList.add("done");all.at(-1).querySelector("span").textContent="Completed ✓";
}

function dashboard(){
 const rs=reports();
 $("total").textContent=rs.length;
 $("high").textContent=rs.filter(r=>r.priority==="HIGH").length;
 $("medium").textContent=rs.filter(r=>r.priority==="MEDIUM").length;
 $("pending").textContent=rs.filter(r=>r.status==="Pending").length;
 $("reports").innerHTML=rs.length?rs.slice().reverse().map(r=>`
  <div class="reportRow">
   <div><b>${esc(r.issue)}</b><br><span>${esc(r.id)}</span></div>
   <div><span>${esc(r.department)}</span></div>
   <div><span>${esc(r.priority)}</span></div>
   <div><span>${esc(r.status)}</span></div>
  </div>`).join(""):'<p class="empty">No reports yet. Submit your first issue above.</p>';
}
function showResult(r){
 $("result").classList.remove("hidden");
 $("issue").textContent=r.issue;$("confidence").textContent=Math.round(r.confidence*100)+"%";
 $("score").textContent=r.score+"/100";$("department").textContent=r.department;
 $("priority").textContent=r.priority;$("priority").className="priority "+r.priority.toLowerCase();
 $("generated").textContent=r.generated;$("reportId").textContent="ID: "+r.id;
 $("reportLocation").textContent="📍 "+r.location;$("reportTime").textContent=r.time;
 $("reasons").innerHTML=r.reasons.map(x=>`<li>${esc(x)}</li>`).join("");
 $("result").scrollIntoView({behavior:"smooth",block:"start"});
}

$("analyze").onclick=async()=>{
 const raw=$("complaint").value.trim();
 if(!raw){$("status").textContent="Please describe the civic issue first.";$("status").className="status error";return}
 $("status").className="status";$("status").textContent="AI agents are analyzing the complaint…";
 $("analyze").disabled=true;$("analyze").textContent="Analyzing…";
 await animateAgents();
 const text=raw.toLowerCase();
 const c=classify(text);
 const p=calculatePriority(text,c.category,!!$("photo").files.length);
 const id="CIV-"+Math.random().toString(36).slice(2,8).toUpperCase();
 const location=coords.lat?`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`:"Location not provided";
 const time=new Date().toLocaleString();
 const generated=`Citizen reports a ${c.category.toLowerCase()} issue. Reported details: ${raw}. Recommended routing: ${DEPT[c.category]}. Estimated priority: ${p.level}.`;
 const r={id,issue:c.category,confidence:c.confidence,score:p.score,priority:p.level,department:DEPT[c.category],location,reasons:p.reasons,generated,status:"Pending",time};
 const rs=reports();rs.push(r);save(rs);
 showResult(r);dashboard();
 $("status").textContent="Analysis complete ✓";
 $("analyze").disabled=false;$("analyze").textContent="Analyze with CivicSathi AI →";
 toast("Civic report generated ✓");
};

$("clear").onclick=()=>{
 if(reports().length && confirm("Delete all saved demo reports?")){localStorage.removeItem(STORE);dashboard();toast("Reports cleared")}
};

$("voice").onclick=()=>{
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){$("status").textContent="Speech recognition is not supported here. Please type the complaint.";return}
 const rec=new Speech();rec.lang="en-IN";rec.interimResults=false;rec.maxAlternatives=1;
 $("status").textContent="Listening… speak now.";
 rec.onresult=e=>{$("complaint").value=e.results[0][0].transcript;$("status").textContent="Voice complaint captured ✓";toast("Voice captured")};
 rec.onerror=()=>{$("status").textContent="Microphone permission or speech recognition is unavailable."};
 rec.start();
};

dashboard();

const officialIdEl=document.getElementById("officialId");
const officialSaved=document.getElementById("officialSaved");
document.getElementById("saveOfficial").onclick=()=>{
 const id=officialIdEl.value.trim();
 if(!id){officialSaved.textContent="Enter the official reference number first.";return}
 localStorage.setItem("civicsathi_official_reference",id);
 officialSaved.textContent="Official reference saved ✓";
 if(typeof toast==="function") toast("Official reference saved");
};
const savedOfficial=localStorage.getItem("civicsathi_official_reference");
if(savedOfficial){officialIdEl.value=savedOfficial;officialSaved.textContent="Saved reference loaded ✓";}

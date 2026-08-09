const state={jobs:[],query:"",category:"",modality:""};
const $=s=>document.querySelector(s);
const clean=s=>s.replace(/\*\*/g,"").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").trim();
function parseMarkdown(md){
  const updated=(md.match(/\*\*Actualizado:\s*([^*]+)\*\*/)||[])[1]||"";
  const jobs=[]; let category="";
  for(const line of md.split("\n")){
    const h=line.match(/^##\s+(?:\d+\.\s*)?(.+)/); if(h){category=clean(h[1]);continue}
    if(!line.startsWith("|")||line.includes("|---")||line.includes("| Puesto |"))continue;
    const cells=line.split("|").slice(1,-1).map(clean); if(cells.length<9)continue;
    const link=(line.match(/\[Ver oferta\]\((https?:\/\/[^)]+)\)/)||[])[1]; if(!link)continue;
    jobs.push({title:cells[0],company:cells[1],modality:cells[2],location:cells[3],salary:cells[4],age:cells[5],date:cells[6],source:cells[7],link,category});
  }
  return {jobs,updated};
}
function optionize(id,values){const el=$(id);[...new Set(values)].sort().forEach(v=>{const o=document.createElement("option");o.value=o.textContent=v;el.append(o)})}
function card(j){return `<article class="job"><div class="job-top"><div><h2>${j.title}</h2><div class="company">${j.company}</div></div><span class="age">${j.age}</span></div><div class="tags"><span class="tag">${j.category}</span><span class="tag">${j.modality}</span><span class="tag">${j.location}</span></div><p class="salary">${j.salary}</p><a class="apply" href="${j.link}" target="_blank" rel="noopener"><span>Ver vacante</span><span class="source">${j.source} ↗</span></a></article>`}
function render(){const q=state.query.toLowerCase();const list=state.jobs.filter(j=>(!q||Object.values(j).join(" ").toLowerCase().includes(q))&&(!state.category||j.category===state.category)&&(!state.modality||j.modality===state.modality));$("#jobs").innerHTML=list.map(card).join("");$("#count").textContent=`${list.length} ${list.length===1?"vacante":"vacantes"}`;$("#empty").hidden=!!list.length;$("#clear").hidden=!state.query&&!state.category&&!state.modality}
async function init(){try{const res=await fetch(`README.md?v=${Date.now()}`);if(!res.ok)throw Error();const data=parseMarkdown(await res.text());state.jobs=data.jobs;optionize("#category",state.jobs.map(j=>j.category));optionize("#modality",state.jobs.map(j=>j.modality));$("#summary").innerHTML=`<span class="pill">${state.jobs.length} vacantes activas</span><span class="pill">Actualizado: ${data.updated}</span>`;render()}catch{$("#jobs").innerHTML='<p class="error">No pudimos cargar las vacantes. Intenta actualizar la página en unos minutos.</p>';$("#count").textContent="Error de carga"}}
$("#search").addEventListener("input",e=>{state.query=e.target.value;render()});$("#category").addEventListener("change",e=>{state.category=e.target.value;render()});$("#modality").addEventListener("change",e=>{state.modality=e.target.value;render()});$("#clear").addEventListener("click",()=>{state.query=state.category=state.modality="";$("#search").value=$("#category").value=$("#modality").value="";render()});init();

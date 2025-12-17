let today = new Date();
today.setHours(0,0,0,0);
let year=today.getFullYear();
let month=today.getMonth();
let selectedDate=null;
const todos=JSON.parse(localStorage.getItem('todos')||'{}');

const calendar=document.getElementById('calendar');
const monthLabel=document.getElementById('monthLabel');

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}


function render(){
  calendar.innerHTML='';
  const first=new Date(year,month,1);
  const days=new Date(year,month+1,0).getDate();
  monthLabel.textContent=first.toLocaleString('default',{month:'long',year:'numeric'});
  for(let i=1;i<=days;i++){
    const d = new Date(year, month, i);
    d.setHours(0,0,0,0);
    const div=document.createElement('div');
    div.className='day';
    div.innerHTML=`<div class=date-number>${i}</div>`;
    if(fmt(d)===fmt(today))div.classList.add('today');
    if(d>today){div.classList.add('disabled');}
    else{div.onclick=()=>openView(d);}
    const key=fmt(d);
    if(todos[key]){
      const projects = Object.keys(todos[key]);
      const label = document.createElement('div');
      label.className = 'project-label';
      projects.forEach((pro) => {
        const proName = document.createElement('p');
        proName.innerText = pro
        label.appendChild(proName);
      })
      div.appendChild(label);
    }
    calendar.appendChild(div);
  }
}

function openView(d){
  const query = searchInput.value.trim().toLowerCase();
  selectedDate = fmt(d);
  const data = todos[selectedDate] || {};
  let html = `<h2>${selectedDate}</h2>`;

  for (const p in data) {
    if (query && !p.toLowerCase().includes(query)) continue;
    const t = data[p];

    html += `<h3>Project - ${p}</h3>`;
    html += section('Tasks completed today', t.completed, selectedDate, p, 'completed');
    html += section('Tasks in progress (not finished yet)', t.inProgress, selectedDate, p, 'inProgress');
    html += section('Plan for tomorrow', t.tomorrow, selectedDate, p, 'tomorrow');
    html += section('Blockers', t.blockers, selectedDate, p, 'blockers');
    html += section('Notes', t.notes, selectedDate, p, 'notes');
  }

  viewContent.innerHTML = html || '<p>No data</p>';
  viewModal.classList.add('active');
}

function section(title, arr, dateKey, projectKey, categoryKey) {
  if (!arr.length) return '';
  return `
    <div class="section">
      <b>${title}</b>
      <ul>
        ${arr.map((i, idx) => `
          <li onclick="openEditTask('${dateKey}','${projectKey}','${categoryKey}',${idx})">${i}</li>
        `).join('')}
      </ul>
    </div>
  `;
}
function openEditTask(date, project, category, index) {
  const oldText = todos[date][project][category][index];

  viewContent.innerHTML = `
    <h3>Edit Task</h3>
    <p><b>${project}</b> – ${category}</p>
    <textarea id="editTaskText">${oldText}</textarea>
    <button class="primary" onclick="saveEdit('${date}','${project}','${category}',${index})">
      Save Changes
    </button>
  `;
}

function saveEdit(date, project, category, index) {
  const val = document.getElementById('editTaskText').value.trim();
  if (!val) return alert('Task empty');
  todos[date][project][category][index] = val;
  localStorage.setItem('todos', JSON.stringify(todos));
  openView(new Date(date));
}

saveTodo.onclick = () => {
  const p = projectInput.value.trim();
  const c = categorySelect.value;
  const t = taskInput.value.trim();
  const d = dateInput.value;
  if (!p || !t || !d) {
    alert('Required');
    return;
  }
  const selected = new Date(d);
  selected.setHours(0,0,0,0);
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  if (selected > todayDate) {
    alert('Future date not allowed');
    return;
  }
  if (!todos[d]) todos[d] = {};
  if (!todos[d][p]) {
    todos[d][p] = {
      completed: [],
      inProgress: [],
      tomorrow: [],
      blockers: [],
      notes: []
    };
  }
  todos[d][p][c].push(t);
  const autoDate = d;
  localStorage.setItem('todos', JSON.stringify(todos));
  addModal.classList.remove('active');
  render();
  openView(new Date(autoDate));
  projectInput.value = '';
  taskInput.value = '';
};


function exportMonth(){
  const out={};
  const ym=`${year}-${String(month+1).padStart(2,'0')}`;
  for(const d in todos){if(d.startsWith(ym))out[d]=todos[d];}
  const a=document.createElement('a');
  a.href='data:application/json,'+encodeURIComponent(JSON.stringify(out,null,2));
  a.download=`todo-${ym}.json`;
  a.click();
}

function exportData(){
  const a=document.createElement('a');
  a.href='data:application/json,'+encodeURIComponent(JSON.stringify(todos,null,2));
  a.download='todo-backup.json';
  a.click();
}

function importData(e){
  const f=e.target.files[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=()=>{localStorage.setItem('todos',r.result);location.reload();};
  r.readAsText(f);
}

menuBtn.onclick=()=>sideMenu.classList.toggle('active');
document.addEventListener('click',e=>{if(!sideMenu.contains(e.target)&&e.target!==menuBtn){sideMenu.classList.remove('active')}});
addBtn.onclick=()=>{
  selectedDate=fmt(today);
  dateInput.value=selectedDate;
  addModal.classList.add('active');
};
addModal.onclick=viewModal.onclick=e=>{if(e.target.classList.contains('modal'))e.target.classList.remove('active')}
prevMonth.onclick=()=>{month--;render()}
nextMonth.onclick=()=>{month++;render()}
render();


function closeAll(){
  addModal.classList.remove('active');
  viewModal.classList.remove('active');
}

function toggleTheme(){
  document.body.classList.toggle('light');
  localStorage.setItem('theme',
    document.body.classList.contains('light')?'light':'dark'
  );
}
if(localStorage.getItem('theme')==='light') document.body.classList.add('light');
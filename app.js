
let DATA = [];
const $ = sel => document.querySelector(sel);
const card = $('#card');
const search = $('#search');
const suggestions = $('#suggestions');

function escapeHTML(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}

async function load(){
  const res = await fetch('drugs.json');
  DATA = await res.json();
  bindSearch();
}

function highlight(text, query){
  if(!query) return escapeHTML(text);
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if(i===-1) return escapeHTML(text);
  const before = escapeHTML(text.slice(0,i));
  const mid = escapeHTML(text.slice(i, i+query.length));
  const after = escapeHTML(text.slice(i+query.length));
  return `${before}<span class="mark">${mid}</span>${after}`;
}

function bindSearch(){
  search.addEventListener('input', e=>{
    const q = e.target.value.trim();
    if(!q){ suggestions.style.display='none'; return; }
    const matches = DATA.filter(d => d.name.toLowerCase().includes(q.toLowerCase())).slice(0,30);
    suggestions.innerHTML = matches.map(d=>`<div class="suggestion" data-code="${d.code}">
      <div>${highlight(d.name,q)}</div>
      <small>${escapeHTML(d.code)}</small>
    </div>`).join('');
    suggestions.style.display = matches.length ? 'block':'none';
  });
  document.addEventListener('click', (e)=>{
    if(e.target.closest('.suggestion')){
      const code = e.target.closest('.suggestion').dataset.code;
      const item = DATA.find(x=>x.code===code);
      if(item){ render(item); search.value = item.name; suggestions.style.display='none'; }
    }else if(!e.target.closest('.search-wrap')){
      suggestions.style.display='none';
    }
  });
}

function badge(label, val){
  let cls='na', text='—';
  if(val==='✓'){ cls='ok'; text='✓'; }
  else if(val==='✕'){ cls='no'; text='✕'; }
  return `<span class="badge ${cls}">${label}: ${text}</span>`;
}

function listDiluents(dl){
  if(!dl || !dl.length) return '—';
  return dl.join(', ');
}

function routeBlock(title, text){
  if(!text) return '';
  const t = text.trim();
  if(!t) return '';
  return `<div class="route-block">
    <h4>${title}</h4>
    <pre>${escapeHTML(t)}</pre>
  </div>`;
}

function render(d){
  const r = d.routes || {};
  const ins = d.instructions || {};
  const conc = d.concentration_mg_per_ml || {min:null,max:null};

  card.innerHTML = `<article class="card">
    <div class="name-row">
      <h2>${escapeHTML(d.name)}</h2>
      <span class="code">${escapeHTML(d.code||'')}</span>
    </div>

    <div class="badges">
      ${badge('IM', r.IM || '—')}
      ${badge('IV direct', r.IV_direct || '—')}
      ${badge('IV infusion', r.IV_infusion || '—')}
      ${ (ins.Other && ins.Other.trim()) ? `<span class="badge">${escapeHTML('อื่นๆ: '+ins.Other.trim())}</span>` : ''}
    </div>

    <dl class="kv">
      <dt>ข้อบ่งใช้</dt><dd>${escapeHTML(d.indications || '—')}</dd>
      <dt>ชนิดสารน้ำที่ใช้ได้</dt><dd>${escapeHTML(listDiluents(d.diluents))}</dd>
    </dl>

    ${routeBlock('IM', ins.IM)}
    ${routeBlock('IV direct', ins.IV_direct)}
    ${routeBlock('IV infusion', ins.IV_infusion)}

    <div class="util">
      <h4>ตรวจความเข้มข้น (mg/mL)</h4>
      <div class="util-row">
        <input type="number" id="doseMg" placeholder="มิลลิกรัมยา (mg)" min="0" step="0.1">
        <select id="dilSel">${(d.diluents||[]).map(x=>`<option value="${escapeHTML(x)}">${escapeHTML(x)}</option>`).join('')}</select>
        <input type="number" id="volMl" placeholder="ปริมาตรสารน้ำ (mL)" min="0" step="1">
        <span class="result" id="resVal">—</span>
      </div>
      <small>เกณฑ์: ${conc.min!=null?conc.min+' ≤ ':''}mg/mL${conc.max!=null?' ≤ '+conc.max:''} (หากมีข้อมูล)</small>
    </div>
  </article>`;

  // small utility
  const dose = document.getElementById('doseMg');
  const vol = document.getElementById('volMl');
  const res = document.getElementById('resVal');
  const update = ()=>{
    const mg = parseFloat(dose.value);
    const ml = parseFloat(vol.value);
    if(!isFinite(mg) || !isFinite(ml) || ml<=0){ res.textContent='—'; res.className='result'; return; }
    const c = mg/ml;
    let txt = c.toFixed(2)+' mg/mL';
    let cls='result';
    if((d.concentration_mg_per_ml||{})){
      const {min,max} = d.concentration_mg_per_ml;
      if(min!=null && c<min){ cls+=' fail'; txt+=' • ต่ำกว่าเกณฑ์'; }
      else if(max!=null && c>max){ cls+=' fail'; txt+=' • สูงกว่าเกณฑ์'; }
      else if(min!=null || max!=null){ cls+=' pass'; txt+=' • อยู่ในเกณฑ์'; }
    }
    res.textContent = txt;
    res.className = cls;
  };
  dose.addEventListener('input', update);
  vol.addEventListener('input', update);
}

load();

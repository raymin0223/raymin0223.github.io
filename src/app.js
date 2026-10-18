'use strict';
(function () {
  var papers = JSON.parse(document.getElementById('publication-data').textContent);
  var paperMap = new Map(papers.map(function (p) { return [p.id, p]; }));
  var topicNames = {compute:'adaptive computation early exit early exiting recursive recursion speculative decoding inference',posttraining:'efficient post-training distillation reinforcement learning rl',architectures:'efficient architecture architectures model hybrid linear attention transformer ssm',agents:'efficient agents agentic systems tool memory routing orchestration',learning:'data training efficiency data selection contrastive self-supervised active learning',other:'other research'};
  var state = {query:'', topic:'all', kind:'all', year:'all'};
  var search = document.getElementById('publication-search');
  var topic = document.getElementById('topic-filter');
  var kind = document.getElementById('type-filter');
  var year = document.getElementById('year-filter');
  var publicationList = document.getElementById('publication-list');
  var rows = Array.from(publicationList.querySelectorAll('.paper-row'));
  var reset = document.getElementById('reset-filters');
  var allButton = document.getElementById('view-all');
  var dialog = document.getElementById('citation-dialog');
  var figureDialog = document.getElementById('figure-dialog');
  var toastTimer;
  function normalize(value) { return String(value).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,' ').replace(/\s+/g,' ').trim(); }
  var searchText = new Map(papers.map(function (p) { return [p.id, normalize([p.title,p.authors.join(' '),p.venue,p.year,p.id,p.id === 'c6' ? 'FREE fast robust early exit' : '',p.id === 'c17' ? 'MoR' : '',p.id === 'p2' ? 'OPRD' : '',p.id === 'c15' ? 'RRT' : ''].concat(p.topics.map(function(t){return topicNames[t];})).join(' '))]; }));
  function matchesPaper(p, terms) {
    return (state.topic === 'all' || p.topics.includes(state.topic)) &&
      (state.kind === 'all' || p.kind === state.kind) &&
      (state.year === 'all' || String(p.year) === state.year) &&
      terms.every(function (term) { return searchText.get(p.id).includes(term); });
  }
  function render() {
    var count = 0;
    var terms = normalize(state.query).split(' ').filter(Boolean);
    rows.forEach(function (row) {
      var p = paperMap.get(row.dataset.paperId);
      var matches = matchesPaper(p, terms);
      row.hidden = !matches;
      if (matches) count++;
    });
    publicationList.querySelectorAll('.publication-year').forEach(function (group) {
      group.hidden = !Array.from(group.querySelectorAll('.paper-row')).some(function (row) { return !row.hidden; });
    });
    search.value = state.query; topic.value = state.topic; kind.value = state.kind; year.value = state.year;
    reset.hidden = !state.query && state.topic === 'all' && state.kind === 'all' && state.year === 'all';
    document.getElementById('result-count').textContent = count + ' publication' + (count === 1 ? '' : 's');
    document.getElementById('empty-state').hidden = count !== 0;
  }
  function clearFilters() { state = {query:'',topic:'all',kind:'all',year:'all'}; render(); }
  search.addEventListener('input',function () { state.query=search.value; render(); });
  topic.addEventListener('change',function () { state.topic=topic.value; render(); });
  kind.addEventListener('change',function () { state.kind=kind.value; render(); });
  year.addEventListener('change',function () { state.year=year.value; render(); });
  reset.addEventListener('click',clearFilters);
  document.getElementById('empty-reset').addEventListener('click',function(){clearFilters();search.focus();});
  allButton.addEventListener('click',clearFilters);
  document.querySelectorAll('[data-topic-link]').forEach(function (link) { link.addEventListener('click',function () { clearFilters();state.topic=link.dataset.topicLink;render(); }); });
  function revealPaper(id) {
    if (!paperMap.has(id)) return;
    clearFilters();
    var row = document.getElementById('pub-' + id);
    row.classList.add('paper-flash');
    setTimeout(function () { row.classList.remove('paper-flash'); },2200);
    requestAnimationFrame(function () { row.scrollIntoView({behavior:'smooth',block:'start'}); });
  }
  document.querySelectorAll('[data-reveal-paper]').forEach(function (link) { link.addEventListener('click',function(event){event.preventDefault();var id=link.dataset.revealPaper;history.replaceState(null,'','#pub-'+id);revealPaper(id);}); });
  window.addEventListener('hashchange',function(){if(location.hash.startsWith('#pub-'))revealPaper(location.hash.slice(5));});
  document.getElementById('main').addEventListener('click',function(event){
    var figureLink=event.target.closest('[data-figure]');
    if(figureLink){
      var figurePaper=paperMap.get(figureLink.dataset.figure);
      if(!figurePaper || !figurePaper.image)return;
      event.preventDefault();
      document.getElementById('figure-title').textContent=figurePaper.title;
      var figureImage=document.getElementById('figure-image');
      figureImage.src='assets/'+figurePaper.image;
      figureImage.alt=figurePaper.imageAlt || 'Main figure from '+figurePaper.title;
      document.getElementById('figure-paper').href=figurePaper.url;
      document.getElementById('figure-original').href='assets/'+figurePaper.image;
      figureDialog.showModal();document.getElementById('close-figure').focus();
      return;
    }
    var button=event.target.closest('[data-cite]');if(!button)return;
    var p=paperMap.get(button.dataset.cite);
    if(!p || !p.citation || !p.citation.bibtex)return;
    document.getElementById('citation-paper-title').textContent=p.title;
    document.getElementById('citation-content').textContent=p.citation.bibtex;
    var citationSource=document.getElementById('citation-source');
    citationSource.href=p.citation.sourceUrl;
    citationSource.textContent='Source: '+p.citation.sourceLabel;
    var citationNote=document.getElementById('citation-note');
    citationNote.textContent=p.citation.displayNote;
    citationNote.hidden=!p.citation.displayNote;
    document.getElementById('copy-citation').innerHTML='<svg class="icon"><use href="#i-copy"/></svg> Copy citation';
    dialog.showModal();document.getElementById('close-citation').focus();
  });
  document.getElementById('close-citation').addEventListener('click',function(){dialog.close();});
  dialog.addEventListener('click',function(event){if(event.target===dialog){var rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  document.getElementById('close-figure').addEventListener('click',function(){figureDialog.close();});
  figureDialog.addEventListener('click',function(event){if(event.target===figureDialog){var rect=figureDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)figureDialog.close();}});
  function showToast(message) {
    var toast=document.getElementById('toast');toast.querySelector('span').textContent=message;toast.hidden=false;
    clearTimeout(toastTimer);toastTimer=setTimeout(function(){toast.hidden=true;},2500);
  }
  async function copyText(value) {
    try { if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(value);return true;} } catch(e) {}
    var textArea=document.createElement('textarea');textArea.value=value;textArea.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    (dialog.open?dialog:document.body).appendChild(textArea);textArea.select();var success=false;
    try {success=document.execCommand('copy');}catch(e){}textArea.remove();return success;
  }
  document.getElementById('copy-citation').addEventListener('click',async function(){
    var success=await copyText(document.getElementById('citation-content').textContent);
    if(success){this.innerHTML='<svg class="icon"><use href="#i-check"/></svg> Copied';this.focus();showToast('BibTeX citation copied');}
    else {var range=document.createRange();range.selectNodeContents(document.getElementById('citation-content'));var selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);showToast('Citation selected — press Ctrl/Cmd+C');}
  });
  document.getElementById('copy-email').addEventListener('click',async function(){showToast(await copyText('bsmn0223@gmail.com')?'Email address copied':'Email: bsmn0223@gmail.com');this.focus();});
  var themeButton=document.getElementById('theme-toggle');
  function updateThemeButton(){var dark=document.documentElement.dataset.theme==='dark';themeButton.setAttribute('aria-label','Switch to '+(dark?'light':'dark')+' theme');themeButton.setAttribute('title','Switch to '+(dark?'light':'dark')+' theme');document.querySelector('meta[name="theme-color"]').content=dark?'#111c2a':'#f7f9fc';}
  themeButton.addEventListener('click',function(){var dark=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem('sangmin-theme',dark?'light':'dark');}catch(e){}updateThemeButton();});updateThemeButton();
  var menuButton=document.getElementById('menu-toggle');var navigation=document.getElementById('navigation');
  function closeMenu(){navigation.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');}
  menuButton.addEventListener('click',function(){var open=navigation.classList.toggle('open');this.setAttribute('aria-expanded',String(open));this.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  navigation.querySelectorAll('a').forEach(function(link){link.addEventListener('click',closeMenu);});
  document.addEventListener('keydown',function(event){if(event.key==='Escape' && navigation.classList.contains('open')){closeMenu();menuButton.focus();}});
  document.addEventListener('click',function(event){if(!event.target.closest('.site-header'))closeMenu();});
  if('IntersectionObserver' in window) {
    var navSections={about:'about',research:'research','selected-publications':'research',education:'education',experience:'experience',awards:'experience',patents:'experience',publications:'publications'};
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){document.querySelectorAll('.nav-link').forEach(function(link){var active=link.hash==='#'+navSections[entry.target.id];link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -65% 0px',threshold:0});
    Object.keys(navSections).forEach(function(id){observer.observe(document.getElementById(id));});
  }
  // Preserve bookmarks from the previous homepage's projects and services sections.
  function revealLegacySection() {
    var id=location.hash.slice(1);
    if(id!=='projects' && id!=='services')return;
    var panel=document.getElementById(id);
    panel.open=true;
    requestAnimationFrame(function(){panel.scrollIntoView({block:'center'});});
  }
  window.addEventListener('hashchange',revealLegacySection);
  render();if(location.hash.startsWith('#pub-'))revealPaper(location.hash.slice(5));
  revealLegacySection();
})();

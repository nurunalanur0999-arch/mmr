/* Bentley Outdoors — preferred appointment date/time calendar.
   No external calendar integration or real-time inventory is claimed. */
(() => {
  const root = document.getElementById('bookingWizard');
  if (!root) return;

  const packages = [
    {key:'consultation',title:'Free Consultation', duration:'30 minutes', price:0, description:'A conversation about your landscaping goals.'},
    {key:'basic',title:'Basic Service', duration:'1 hour', price:99, description:'For focused outdoor service needs.'},
    {key:'advanced',title:'Advanced Service', duration:'1 hour', price:199, description:'For detailed outdoor projects and planning.'}
  ];
  const defaults = {maintenance:'basic',installation:'basic',irrigation:'basic','landscape-design':'advanced','garden-design':'advanced','anything-outdoors':'consultation'};
  const services = {
    maintenance:{label:'Maintenance',image:'serviceMaintenance'},
    installation:{label:'Installation',image:'serviceInstallation'},
    irrigation:{label:'Irrigation',image:'serviceIrrigation'},
    'landscape-design':{label:'Landscape Design',image:'serviceLandscapeDesign'},
    'garden-design':{label:'Garden Design',image:'serviceGardenDesign'},
    'anything-outdoors':{label:'Anything Outdoors',image:'serviceAnythingOutdoors'}
  };
  const byId = id => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const key = services[params.get('serviceKey')] ? params.get('serviceKey') : 'anything-outdoors';
  const service = services[key];
  const price = amount => amount === 0 ? 'Free' : `$${amount.toFixed(2)}`;
  const safePackage = packages.some(item => item.key === params.get('package')) ? params.get('package') : defaults[key];
  const images = window.BENTLEY_IMG || {};
  const photo = byId('bookingHeroImage');
  if (photo) { photo.src = images[service.image] || images.heroBannerHilltop || photo.src; photo.alt = service.label + ' service by Bentley Outdoors'; }
  byId('bookingServiceCaption').textContent = service.label + ' · Bentley Outdoors';
  byId('bookingLeftService').textContent = service.label;

  // All calendar dates are based on local business date in Georgia (Eastern time).
  const zone = 'America/New_York';
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part = type => Number(parts.find(x=>x.type===type).value);
  const todayUTC = new Date(Date.UTC(part('year'), part('month') - 1, part('day')));
  const minDate = addDays(todayUTC, 1); // Avoid same-day appointments that cannot be confirmed in time.
  const maxDate = addDays(todayUTC, 120);
  const state = {step:1,pkg:packages.find(x=>x.key===safePackage),viewYear:minDate.getUTCFullYear(),viewMonth:minDate.getUTCMonth(),date:null,time:''};

  const fullDate = date => new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(date);
  const dateKey = date => `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;
  const monthTitle = (y,m) => new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'long',year:'numeric'}).format(new Date(Date.UTC(y,m,1)));
  function addDays(date,n) { const d=new Date(date.getTime()); d.setUTCDate(d.getUTCDate()+n); return d; }
  const sameDate = (a,b) => Boolean(a&&b&&dateKey(a)===dateKey(b));
  const selectedLabel = () => state.date && state.time ? `${fullDate(state.date)} at ${state.time} Eastern Time (ET)` : 'Choose a date and preferred time';

  function showStep(n) {
    state.step=n;
    root.querySelectorAll('[data-step]').forEach(el => {el.hidden = Number(el.dataset.step)!==n;});
    root.querySelectorAll('.booking-progress-step').forEach((dot,i) => {
      dot.classList.toggle('active',i===n-1);dot.classList.toggle('done',i<n-1);
      if (i===n-1) dot.setAttribute('aria-current','step'); else dot.removeAttribute('aria-current');
    });
    root.dataset.activeStep=String(n);
    if(n===3) fillConfirmation();
    root.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }

  function selectPackage(pkg) {
    state.pkg=pkg;
    byId('selectedPackageSummary').textContent=`${pkg.title} · ${pkg.duration}`;
    byId('selectedPackageSummaryDetail').textContent=`${price(pkg.price)} · ${service.label}`;
    byId('appointmentOptions').querySelectorAll('[data-package]').forEach(btn => btn.classList.toggle('active',btn.dataset.package===pkg.key));
    showStep(2);
  }

  byId('appointmentOptions').innerHTML=packages.map(pkg=>
    `<button type="button" class="booking-option${pkg.key===state.pkg.key?' active':''}" data-package="${pkg.key}"><div><strong>${pkg.title}</strong><span>${pkg.duration} · ${price(pkg.price)}</span><small>${pkg.description}</small></div><span class="booking-option-cta">Select →</span></button>`
  ).join('');
  byId('appointmentOptions').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    const pkg=packages.find(x=>x.key===btn.dataset.package); if(pkg) selectPackage(pkg);
  }));

  function renderCalendar() {
    const y=state.viewYear,m=state.viewMonth;
    byId('calendarMonthTitle').textContent=monthTitle(y,m);
    const first=new Date(Date.UTC(y,m,1));
    const nDays=new Date(Date.UTC(y,m+1,0)).getUTCDate();
    const leading=first.getUTCDay();
    const cells=[];
    for(let blank=0;blank<leading;blank++) cells.push('<span class="booking-calendar-blank" aria-hidden="true"></span>');
    for(let day=1;day<=nDays;day++) {
      const value=new Date(Date.UTC(y,m,day));
      const valid=value>=minDate&&value<=maxDate&&value.getUTCDay()!==0;
      const selected=sameDate(state.date,value);
      const inRange=(value>=minDate&&value<=maxDate);
      cells.push(`<button type="button" class="booking-calendar-day${selected?' selected':''}${!valid?' unavailable':''}${inRange&&value.getUTCDay()===0?' closed':''}" data-day="${day}" aria-label="${fullDate(value)}${valid?'':' not selectable'}" aria-pressed="${selected}" ${valid?'':'disabled'}>${day}</button>`);
    }
    byId('bookingCalendar').innerHTML=cells.join('');
    byId('calendarPrev').disabled=(y===minDate.getUTCFullYear()&&m===minDate.getUTCMonth());
    byId('calendarNext').disabled=(y===maxDate.getUTCFullYear()&&m===maxDate.getUTCMonth());
    byId('bookingCalendar').querySelectorAll('button:not([disabled])').forEach(btn=>btn.addEventListener('click',()=>{
      state.date=new Date(Date.UTC(y,m,Number(btn.dataset.day)));
      state.time='';
      renderCalendar();renderTimes();
    }));
  }

  function shiftMonth(delta) {
    const dt=new Date(Date.UTC(state.viewYear,state.viewMonth+delta,1));
    const earliest=new Date(Date.UTC(minDate.getUTCFullYear(),minDate.getUTCMonth(),1));
    const latest=new Date(Date.UTC(maxDate.getUTCFullYear(),maxDate.getUTCMonth(),1));
    if(dt<earliest||dt>latest)return;
    state.viewYear=dt.getUTCFullYear();state.viewMonth=dt.getUTCMonth();renderCalendar();
  }
  byId('calendarPrev').addEventListener('click',()=>shiftMonth(-1));
  byId('calendarNext').addEventListener('click',()=>shiftMonth(1));

  function renderTimes() {
    const box=byId('bookingTimeSlots');
    const heading=byId('bookingSelectedDayHeading');
    const summary=byId('selectedTimeSummary');
    const next=byId('continueToInfo');
    if(!state.date) {
      heading.textContent='Choose a date';
      byId('bookingTimeHelp').textContent='Select a date on the calendar to see preferred time choices.';
      box.innerHTML='<span class="booking-time-placeholder">Select a date to continue</span>';
      summary.hidden=true;next.disabled=true;return;
    }
    heading.textContent=new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'long',month:'short',day:'numeric'}).format(state.date);
    byId('bookingTimeHelp').textContent='Select the time you would prefer. These are not live availability slots.';
    const slots=[];
    for(let hour=9;hour<=16;hour++)for(let minute of [0,30]){
      const hour12=hour%12||12;const suffix=hour>=12?'PM':'AM';slots.push(`${hour12}:${String(minute).padStart(2,'0')} ${suffix}`);
    }
    box.innerHTML=slots.map(t=>`<button class="booking-time-choice${state.time===t?' selected':''}" type="button" data-time="${t}" aria-pressed="${state.time===t}">${t}</button>`).join('');
    box.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      state.time=button.dataset.time;renderTimes();
    }));
    const ready=Boolean(state.time);
    next.disabled=!ready;summary.hidden=!ready;
    if(ready)byId('selectedTimeText').textContent=selectedLabel();
  }

  function fillConfirmation() {
    byId('appointmentConfirmSummary').textContent=`${state.pkg.title} with Bentley Outdoors`;
    byId('appointmentDateSummary').textContent=selectedLabel();
    byId('appointmentServiceSummary').textContent=service.label;
    byId('appointmentPriceSummary').textContent=`${state.pkg.duration} · ${price(state.pkg.price)}`;
    const set=(id,value)=>{byId(id).value=value;};
    set('appointmentServiceField',service.label);
    set('appointmentPackageField',state.pkg.title);
    set('appointmentDurationField',state.pkg.duration);
    set('appointmentPriceField',price(state.pkg.price));
    set('appointmentDateField',state.date?dateKey(state.date):'');
    set('appointmentTimeField',state.time);
    set('appointmentDisplayField',selectedLabel());
  }

  byId('continueToInfo').addEventListener('click',()=>{
    if(!state.date||!state.time)return;
    showStep(3);
  });
  root.querySelectorAll('[data-booking-nav]').forEach(btn=>btn.addEventListener('click',()=>showStep(Number(btn.dataset.bookingNav))));
  byId('appointmentBookingForm').addEventListener('submit', event=>{
    if(!state.date||!state.time){event.preventDefault();showStep(2);return;}
    fillConfirmation();
    // A valid submission is processed by Netlify Forms. This is not a live booking lock.
  });
  renderCalendar();renderTimes();
  showStep(1);
})();

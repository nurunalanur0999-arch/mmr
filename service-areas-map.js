/* Bentley Outdoors service areas map. No API keys or build dependencies required. */
(function () {
 "use strict";
 const cities = [
  {id:"marietta",name:"Marietta",region:"Cobb County",lat:33.9526,lng:-84.54993},
  {id:"roswell",name:"Roswell",region:"North Fulton",lat:34.02324,lng:-84.36156},
  {id:"buckhead",name:"Buckhead",region:"Atlanta",lat:33.845,lng:-84.3646},
  {id:"canton",name:"Canton",region:"Cherokee County",lat:34.23676,lng:-84.49076},
  {id:"kennesaw",name:"Kennesaw",region:"Cobb County",lat:34.02343,lng:-84.61549},
  {id:"acworth",name:"Acworth",region:"Home base · Cobb County",lat:34.06593,lng:-84.67688},
  {id:"alpharetta",name:"Alpharetta",region:"North Fulton",lat:34.07538,lng:-84.29409},
 ];
 const byId = new Map(cities.map(c => [c.id,c]));
 const townButtons = Array.from(document.querySelectorAll('.area-town'));
 const schematicCities = Array.from(document.querySelectorAll('.geo-city'));
 const liveMapEl = document.getElementById('areaMapLive');
 const mapStage = document.getElementById('areaMapStage');
 const mapsLink = document.getElementById('areaMapsLink');
 const selectedName = document.getElementById('areaSelectedName');
 const selectedText = document.getElementById('areaSelectedText');
 let map = null, markers = new Map(), active = 'marietta';
 const mapURL = c => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.name + ', Georgia');

 function updateSelected(id, options={}) {
   const c = byId.get(id); if (!c) return;
   active = id;
   selectedName.textContent = c.name + ', Georgia';
   selectedText.textContent = (id === 'acworth' ? 'Bentley Outdoors is based in Acworth. ' : '') + 'Contact us to confirm service for your address and project.';
   mapsLink.href = mapURL(c);
   townButtons.forEach(b => {
     const on = b.dataset.city === id;
     b.classList.toggle('is-selected',on);
     b.setAttribute('aria-pressed',String(on));
   });
   schematicCities.forEach(g => {
     const on = g.dataset.city === id;
     g.classList.toggle('is-selected',on);
     g.setAttribute('aria-pressed',String(on));
   });
   markers.forEach((marker,k)=> {
     const el = marker.getElement();
     if (el) el.classList.toggle('is-active',k===id);
   });
   if (map && mapStage.classList.contains('map-live-ready') && options.fly !== false) {
     map.flyTo([c.lat,c.lng], Math.max(map.getZoom(),11), {animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, duration: .65});
     const marker = markers.get(id);
     if (marker && options.popup) marker.openPopup();
   }
 }
 for (const b of townButtons) b.addEventListener('click',()=>updateSelected(b.dataset.city,{popup:true}));
 for (const g of schematicCities) {
   g.addEventListener('click',()=>updateSelected(g.dataset.city,{popup:true}));
   g.addEventListener('keydown', e => {
     if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();updateSelected(g.dataset.city,{popup:true});}
   });
 }
 const resetBtn = document.getElementById('mapShowAll');
 if (resetBtn) resetBtn.addEventListener('click', () => {
   if (map && mapStage.classList.contains('map-live-ready')) {
     map.fitBounds(cities.map(c=>[c.lat,c.lng]), {padding:[45,45],maxZoom:10,animate:false});
     map.closePopup();
   }
   updateSelected('marietta',{fly:false});
 });
 updateSelected('marietta',{fly:false});

 // Progressive enhancement. The complete labeled SVG stays visible if Leaflet/tiles are blocked.
 if (!liveMapEl || !window.L) return;
 try {
   map = window.L.map(liveMapEl, {scrollWheelZoom:false, zoomControl:false, preferCanvas:true});
   window.L.control.zoom({position:'bottomright'}).addTo(map);
   let tileLoaded = false;
   const layer = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
     maxZoom:18, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
   });
   layer.on('tileload',()=> {
     if (!tileLoaded) {
       tileLoaded=true;
       mapStage.classList.add('map-live-ready');
       map.invalidateSize();
     }
   });
   layer.addTo(map);
   cities.forEach(c=>{
     const marker = window.L.marker([c.lat,c.lng],{icon:window.L.divIcon({className:'bent-marker',html:'<div></div>',iconSize:[28,28],iconAnchor:[14,14]})}).addTo(map);
     // Names and URLs originate only from the fixed city list, never untrusted user input.
     marker.bindPopup('<strong>'+c.name+', Georgia</strong><br><span style="font-size:12px;color:#667569">Approximate city center</span><br><a href="'+mapURL(c)+'" target="_blank" rel="noopener noreferrer">View on Google Maps ↗</a>');
     marker.on('click',()=>updateSelected(c.id,{fly:false}));
     markers.set(c.id,marker);
   });
   map.fitBounds(cities.map(c=>[c.lat,c.lng]),{padding:[42,42],maxZoom:10,animate:false});
 } catch(e) {
   // Keep functional area cards and standalone schematic if a map provider is unavailable.
   console.warn('The live map could not be initialized. The fallback service-area map remains available.',e);
 }
})();

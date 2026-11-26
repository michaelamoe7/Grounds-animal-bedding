// Store finder map: pins every store in js/stores.js (window.GROUNDS_STORES).
(function () {
  var el = document.getElementById('store-map');
  if (!el || !window.L || !window.GROUNDS_STORES) return;

  var stores = window.GROUNDS_STORES;
  var map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25 });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  // Only zoom with the scroll wheel after the visitor clicks the map.
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  var pin = L.divIcon({ className: 'store-pin', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10] });
  var cluster = L.markerClusterGroup({
    showCoverageOnHover: false, maxClusterRadius: 45,
    iconCreateFunction: function (c) {
      var n = c.getChildCount();
      var size = n < 10 ? 34 : n < 50 ? 42 : 50;
      return L.divIcon({ html: '<span>' + n + '</span>', className: 'store-cluster', iconSize: [size, size] });
    }
  });

  function esc(t) { return String(t || '').replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function address(s) { return [s.s, [s.c, s.st].filter(Boolean).join(', ') + (s.z ? ' ' + s.z : '')].filter(Boolean).join('<br>'); }
  function directions(s) {
    var q = s.s ? [s.r, s.s, s.c, s.st, s.z].join(' ') : s.lat + ',' + s.lon;
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }
  function popup(s) {
    return '<strong>' + esc(s.r) + '</strong><br>' + esc(address(s)).replace(/&lt;br&gt;/g, '<br>') +
      '<div class="popup-links"><a href="' + directions(s) + '" target="_blank" rel="noopener">Directions</a>' +
      (s.u ? ' &middot; <a href="' + esc(s.u) + '" target="_blank" rel="noopener">Store page</a>' : '') + '</div>';
  }

  stores.forEach(function (s) {
    s.marker = L.marker([s.lat, s.lon], { icon: pin, title: s.r + ' – ' + s.c + ', ' + s.st }).bindPopup(popup(s));
  });

  var select = document.getElementById('retailer-filter');
  var count = document.getElementById('store-count');
  var names = Array.from(new Set(stores.map(function (s) { return s.r; }))).sort();
  names.forEach(function (n) { var o = document.createElement('option'); o.value = n; o.textContent = n; select.appendChild(o); });

  function visible() { return stores.filter(function (s) { return !select.value || s.r === select.value; }); }
  function draw(fit) {
    var list = visible();
    cluster.clearLayers();
    cluster.addLayers(list.map(function (s) { return s.marker; }));
    count.textContent = list.length + ' stores' + (select.value ? ' at ' + select.value : ' across ' + new Set(list.map(function (s) { return s.st; })).size + ' states');
    if (fit && list.length) map.fitBounds(L.latLngBounds(list.map(function (s) { return [s.lat, s.lon]; })), { padding: [20, 20] });
  }
  map.addLayer(cluster);
  draw(true);
  select.addEventListener('change', function () { draw(true); });

  // "Stores near me": browser location -> 5 closest stores.
  var nearest = document.getElementById('nearest');
  var btn = document.getElementById('near-me');
  function miles(a, b, c, d) {
    var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2);
    return 3958.8 * 2 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y));
  }
  btn.addEventListener('click', function () {
    if (!navigator.geolocation) { count.textContent = 'Your browser can’t share your location. Zoom the map instead.'; return; }
    btn.disabled = true; btn.textContent = 'Finding you…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      var near = visible().map(function (s) { return { s: s, d: miles(lat, lon, s.lat, s.lon) }; })
        .sort(function (a, b) { return a.d - b.d; }).slice(0, 5);
      nearest.innerHTML = '<li class="nearest-title">Closest to you</li>' + near.map(function (n) {
        return '<li><button type="button" data-i="' + stores.indexOf(n.s) + '"><strong>' + esc(n.s.r) + '</strong><span>' +
          esc(n.s.c) + ', ' + esc(n.s.st) + ' &middot; ' + Math.round(n.d) + ' mi</span></button></li>';
      }).join('');
      nearest.hidden = false;
      L.circleMarker([lat, lon], { radius: 7, color: '#fff', weight: 2, fillColor: '#2f6fdf', fillOpacity: 1 }).addTo(map);
      map.fitBounds(L.latLngBounds([[lat, lon]].concat(near.map(function (n) { return [n.s.lat, n.s.lon]; }))), { padding: [40, 40], maxZoom: 11 });
      btn.disabled = false; btn.textContent = 'Stores near me';
    }, function () {
      btn.disabled = false; btn.textContent = 'Stores near me';
      count.textContent = 'Location is off. Zoom in on the map to find your nearest store.';
    }, { timeout: 10000 });
  });
  nearest.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]'); if (!b) return;
    var s = stores[+b.dataset.i];
    cluster.zoomToShowLayer(s.marker, function () { s.marker.openPopup(); });
  });
})();

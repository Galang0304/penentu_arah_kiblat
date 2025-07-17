let userMarker = null;
let userArrowRotation = 0;
let mapInstance = null;
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("btn-kalibrasi").onclick = function() {
    document.getElementById("kalibrasi-instruksi").style.display = "block";
    setTimeout(() => {
      document.getElementById("kalibrasi-instruksi").style.display = "none";
    }, 8000);
  };
});
function getLocation() {
  document.getElementById("status-izin-lokasi").innerHTML = '<span style="color:#888;">⏳ Meminta izin lokasi...</span>';
  document.getElementById("loading").style.display = "block";
  document.getElementById("kiblat").innerHTML = "";
  document.getElementById("koordinat").innerHTML = "";
  document.getElementById("map").style.display = "none";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showKiblat, showError);
  } else {
    document.getElementById("loading").style.display = "none";
    document.getElementById("kiblat").innerHTML = "Geolocation tidak didukung browser Anda.";
    document.getElementById("status-izin-lokasi").innerHTML = '<span style="color:#d32f2f;">❌ Geolocation tidak didukung browser Anda.</span>';
  }
}
function showKiblat(position) {
  document.getElementById("status-izin-lokasi").innerHTML = '<span style="color:#388e3c;">✔️ Izin lokasi diberikan.</span>';
  document.getElementById("loading").style.display = "none";
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;
  document.getElementById("koordinat").innerHTML = `Koordinat Anda: <strong>${userLat.toFixed(5)}, ${userLng.toFixed(5)}</strong>`;
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const dLon = (kaabaLng - userLng) * Math.PI / 180;
  const lat1 = userLat * Math.PI / 180;
  const lat2 = kaabaLat * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let brng = Math.atan2(y, x);
  brng = brng * 180 / Math.PI;
  brng = (brng + 360) % 360;
  document.getElementById("kiblat").innerHTML = `Arah kiblat dari lokasi Anda adalah <strong>${brng.toFixed(2)}°</strong> dari Utara.`;
  showMap(userLat, userLng, kaabaLat, kaabaLng);
  enableUserArrowOnMap();
}
function showMap(userLat, userLng, kaabaLat, kaabaLng) {
  document.getElementById("map").style.display = "block";
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    document.getElementById("map").innerHTML = '<div style="color:#d32f2f;padding:20px;">Google Maps gagal dimuat. Pastikan API key sudah benar.</div>';
    return;
  }
  const userPos = { lat: userLat, lng: userLng };
  const kaabaPos = { lat: kaabaLat, lng: kaabaLng };
  mapInstance = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: userPos,
    mapTypeId: 'roadmap',
    streetViewControl: false,
    fullscreenControl: false
  });
  const arrowSvg = {
    path: "M0,-30 L10,10 L0,5 L-10,10 Z",
    fillColor: "#388e3c",
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: 2,
    rotation: userArrowRotation,
    scale: 1.5,
    anchor: new google.maps.Point(0, 10)
  };
  if (userMarker) userMarker.setMap(null);
  userMarker = new google.maps.Marker({
    position: userPos,
    map: mapInstance,
    title: "Lokasi & Arah Anda",
    icon: arrowSvg
  });
  new google.maps.Marker({
    position: kaabaPos,
    map: mapInstance,
    title: "Ka'bah",
    icon: {
      url: 'img/kaaba_icon.png',
      scaledSize: new google.maps.Size(32,32)
    }
  });
  new google.maps.Polyline({
    path: [userPos, kaabaPos],
    geodesic: true,
    strokeColor: '#d4af37',
    strokeOpacity: 0.9,
    strokeWeight: 4,
    map: mapInstance
  });
}
function enableUserArrowOnMap() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientationabsolute', updateUserArrowRotation, true);
    window.addEventListener('deviceorientation', updateUserArrowRotation, true);
  }
}
function updateUserArrowRotation(event) {
  let heading;
  if (typeof event.webkitCompassHeading !== 'undefined') {
    heading = event.webkitCompassHeading;
    if (window.orientation === 90) {
      heading = heading - 90;
    } else if (window.orientation === -90) {
      heading = heading + 90;
    }
  } else {
    heading = event.alpha;
  }
  if (heading == null) return;
  userArrowRotation = -heading;
  if (userMarker) {
    const icon = userMarker.getIcon();
    icon.rotation = userArrowRotation;
    userMarker.setIcon(icon);
  }
  if (typeof event.webkitCompassHeading !== 'undefined' && Math.abs(userArrowRotation) < 1) {
    document.getElementById("kompas-status").innerText = "Jika arah panah tidak sesuai, silakan kalibrasi kompas HP Anda (gerakkan membentuk angka 8 di udara).";
    document.getElementById("kalibrasi-instruksi").style.display = "block";
    setTimeout(() => {
      document.getElementById("kalibrasi-instruksi").style.display = "none";
    }, 8000);
  }
}
function enableUserCompass() {
  const btnIzin = document.getElementById("btn-kompas-izin");
  btnIzin.style.display = "none";
  document.getElementById("kompas-status").innerText = "";
  document.getElementById("status-izin-kompas").innerHTML = '';
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
    btnIzin.style.display = "inline-block";
    btnIzin.onclick = function() {
      DeviceOrientationEvent.requestPermission().then(function(response) {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          document.getElementById("kompas-status").innerText = "Kompas aktif.";
          btnIzin.style.display = "none";
          document.getElementById("status-izin-kompas").innerHTML = '<span style="color:#388e3c;">✔️ Izin kompas diberikan.</span>';
        } else {
          document.getElementById("kompas-status").innerText = "Izin kompas ditolak.";
          document.getElementById("status-izin-kompas").innerHTML = '<span style="color:#d32f2f;">❌ Izin kompas ditolak.</span>';
        }
      }).catch(function() {
        document.getElementById("kompas-status").innerText = "Gagal meminta izin kompas.";
        document.getElementById("status-izin-kompas").innerHTML = '<span style="color:#d32f2f;">❌ Gagal meminta izin kompas.</span>';
      });
    };
    document.getElementById("kompas-status").innerText = "Tekan tombol di atas untuk mengaktifkan kompas.";
    document.getElementById("status-izin-kompas").innerHTML = '<span style="color:#888;">⏳ Menunggu izin kompas...</span>';
  } else if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    document.getElementById("kompas-status").innerText = "Kompas aktif.";
    document.getElementById("status-izin-kompas").innerHTML = '<span style="color:#388e3c;">✔️ Kompas aktif.</span>';
  } else {
    document.getElementById("kompas-instruksi").innerText = "Sensor kompas tidak didukung di perangkat ini.";
    document.getElementById("kompas-status").innerText = "Sensor kompas tidak tersedia.";
    document.getElementById("status-izin-kompas").innerHTML = '<span style="color:#d32f2f;">❌ Sensor kompas tidak tersedia.</span>';
  }
}
function showError(error) {
  document.getElementById("loading").style.display = "none";
  let msg = "";
  switch(error.code) {
    case error.PERMISSION_DENIED:
      msg = "Izin lokasi ditolak.";
      document.getElementById("status-izin-lokasi").innerHTML = '<span style="color:#d32f2f;">❌ Izin lokasi ditolak.</span>';
      break;
    case error.POSITION_UNAVAILABLE:
      msg = "Lokasi tidak tersedia.";
      document.getElementById("status-izin-lokasi").innerHTML = '<span style="color:#d32f2f;">❌ Lokasi tidak tersedia.</span>';
      break;
    case error.TIMEOUT:
      msg = "Permintaan lokasi terlalu lama.";
      document.getElementById("status-izin-lokasi").innerHTML = '<span style="color:#d32f2f;">❌ Permintaan lokasi terlalu lama.</span>';
      break;
    case error.UNKNOWN_ERROR:
      msg = "Terjadi kesalahan tidak diketahui.";
      document.getElementById("status-izin-lokasi").innerHTML = '<span style="color:#d32f2f;">❌ Terjadi kesalahan tidak diketahui.</span>';
      break;
  }
  document.getElementById("kiblat").innerHTML = msg;
  document.getElementById("map").style.display = "none";
  document.getElementById("kompas-instruksi").style.display = "none";
  document.getElementById("kompas-status").innerText = "";
  document.getElementById("btn-kompas-izin").style.display = "none";
} 
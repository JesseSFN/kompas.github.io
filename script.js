const TARGET_LAT = 51.52939950250961;
const TARGET_LON = 4.448781133107181;

const needle = document.getElementById("needle");
const status = document.getElementById("status");
const startBtn = document.getElementById("start");

let phoneHeading = 0;
let userLat = null;
let userLon = null;

/* helpers */
function toRad(deg) {
  return deg * Math.PI / 180;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.cos(toRad(lon2 - lon1));

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function updateNeedle() {
  if (userLat === null || userLon === null) return;

  const targetBearing = calculateBearing(
    userLat,
    userLon,
    TARGET_LAT,
    TARGET_LON
  );

  const rotation = targetBearing - phoneHeading;

  needle.style.transform =
    `translate(-50%, -50%) rotate(${rotation}deg)`;
}

/* START (iOS proof) */
startBtn.addEventListener("click", async () => {
  status.innerText = "Locatie ophalen…";

  /* iOS orientation permission */
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== "granted") {
        status.innerText = "Kompas-toegang geweigerd";
        return;
      }
    } catch {
      status.innerText = "Kompas mislukt";
      return;
    }
  }

  /* GPS */
  navigator.geolocation.watchPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLon = pos.coords.longitude;
      updateNeedle();
      status.innerText = "Richting scoutinggebouw";
    },
    err => {
      status.innerText = "Locatie niet beschikbaar";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );

  /* orientation */
  window.addEventListener("deviceorientationabsolute", e => {
    if (e.alpha !== null) {
      phoneHeading = e.alpha;
      updateNeedle();
    }
  });

  startBtn.style.display = "none";
});

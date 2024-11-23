let watchId = null;
let map;
let destinationMarker = null;



document.addEventListener('DOMContentLoaded', () => {
    getMyLocation();
    
    document.getElementById('setDestination').onclick = setDestination;
});

document.getElementById('goToDestination').onclick = goToDestination;

function goToDestination() {
    if (!destinationMarker) {
        alert("Встановіть встановіть пункт призначення");
        return;
    }
    
    const destLatLng = destinationMarker.getLatLng();
    
    map.setView([destLatLng.lat, destLatLng.lng], 13);
}

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayLocation, displayError);
        
        document.getElementById('watch').onclick = watchLocation;
        document.getElementById('clearWatch').onclick = clearWatch;
    } else {
        alert("Геолокація не підтримується");
    }
}

let college = {
    coords: {
        latitude: 48.94303236806863,
        longitude: 24.73366918867751
    }
};

function displayLocation(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let accuracy = position.coords.accuracy;
    let timestamp = new Date(position.timestamp).toLocaleString();
    
    let div = document.getElementById("location");
    div.innerHTML = `You are at Latitude: ${latitude}, Longitude: ${longitude}`;
    div.innerHTML += `(with ${accuracy} meters accuracy)`;
    
    let kmToCollege = computeDistance(position.coords, college.coords);
    let distance = document.getElementById("distance");
    distance.innerHTML = `You are ${kmToCollege.toFixed(2)} km from the College`;

    if (!map) {
        map = L.map('map').setView([latitude, longitude], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);
    } else {
        map.setView([latitude, longitude], 13);
    }

    let marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`Latitude: ${latitude}, Longitude: ${longitude}<br>Time: ${timestamp}`).openPopup();
    
    if (destinationMarker) {
        let destCoords = {
            latitude: parseFloat(destinationMarker.getLatLng().lat),
            longitude: parseFloat(destinationMarker.getLatLng().lng)
        };
        let kmToDestination = computeDistance(position.coords, destCoords);
        distance.innerHTML += `<br>You are ${kmToDestination.toFixed(2)} km from the destination`;
    }
}

function displayError(error) {
    const errorTypes = {
        0: "Unknown error",
        1: "Permission denied by user",
        2: "Position is not available",
        3: "Request timed out"
    };
    let errorMessage = errorTypes[error.code];
    if (error.code === 0 || error.code === 2) {
        errorMessage += " " + error.message;
    }
    let div = document.getElementById("location");
    div.innerHTML = errorMessage;
    console.log(error);
}

function computeDistance(startCoords, destCoords) {
    let startLatRads = degreesToRadians(startCoords.latitude);
    let startLongRads = degreesToRadians(startCoords.longitude);
    let destLatRads = degreesToRadians(destCoords.latitude);
    let destLongRads = degreesToRadians(destCoords.longitude);
    let Radius = 6371;
    let distance = Math.acos(
        Math.sin(startLatRads) * Math.sin(destLatRads) +
        Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)
    ) * Radius;
    return distance;
}

function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function watchLocation() {
    watchId = navigator.geolocation.watchPosition(displayLocation, displayError);
}

function clearWatch() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function setDestination() {
    let destLatitude = parseFloat(document.getElementById('destLatitude').value);
    let destLongitude = parseFloat(document.getElementById('destLongitude').value);
    
    if (isNaN(destLatitude) || isNaN(destLongitude)) {
        alert("Будь ласка, введіть коректні дані");
        return;
    }

    if (!map) {
        alert("Наразі, карта не ініціалізована");
        return;
    }

    let timestamp = new Date().toLocaleString();

    if (destinationMarker) {
        destinationMarker
            .setLatLng([destLatitude, destLongitude])
            .bindPopup(`Latitude: ${destLatitude}, Longitude: ${destLongitude}<br>Time: ${timestamp}`)
            .openPopup();
    } else {
        destinationMarker = L.marker([destLatitude, destLongitude])
            .addTo(map)
            .bindPopup(`Latitude: ${destLatitude}, Longitude: ${destLongitude}<br>Time: ${timestamp}`)
            .openPopup();
    }
    map.setView([destLatitude, destLongitude], 13);
}


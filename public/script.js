let previousMarker = null;
const map = L.map('Map',{ zoomControl: false, minZoom:1.1}).setView([0,0],5);
document.addEventListener('DOMContentLoaded', () => {
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileURL, {attribution});
    tiles.addTo(map);
});

//Add countries to select box
selects = document.querySelectorAll("select");
selects.forEach((select, id) => {
    for (let country_code in countries) {
        let selected = id === 0 && country_code === "QS" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        select.insertAdjacentHTML("beforeend", option);
    }
});

document.getElementById('submit').addEventListener('click', async(event)=>{
    event.preventDefault();
    const cityID = document.getElementById('inputs').value;
    const countryID = document.getElementById('country').value;
    const data = {cityID, countryID}
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    const options2 = {...options};

    try{
        const response = await fetch('/api', options);
        if(!response.ok) {throw new Error(`HTTP ERROR Status:${response.status}`)};
        const json = await response.json(); 

        DisplayWeather(json.data.weatherData);

        const response2 = await fetch('/location', options2);
        if(!response2.ok) {throw new Error(`HTTP ERROR Status:${response2.status}`)};
        const json2 = await response2.json(); 

        ObtainCoords(json2.data.locationData[0]);

    }catch(error){
        console.log('Error in fetch GERE:', error);
        const output = document.querySelector('.output');
        const err = document.createElement('p');
        err.innerHTML = 'City Does Not Exist In This Country!';
        err.classList.add("error-class");
        output.innerHTML = '';
        output.appendChild(err);
    }
});

function DisplayWeather(data){
    const output = document.querySelector('.output');
    const cityID = document.querySelector('#inputs').value;
    const countryID = document.getElementById('country').value;

    const city = document.createElement('h1');
    const flag = document.createElement('img');
    const temp = document.createElement('h1');
    const main = document.createElement('h2');
    const icon = document.createElement('img');
    const minmax = document.createElement('h4');
    const roots = document.createElement('div');
    const cityContainer = document.createElement('div');
    const mainContainer = document.createElement('div');
    
    city.textContent = `${cityID.toUpperCase()}`
    temp.textContent = `Temperature : ${data.main.temp} °C`
    if(countryID !== "QS"){
        flag.src= `https://flagsapi.com/${countryID}/shiny/64.png`;
    }
    main.textContent = `${data.weather[0].main} ⟶ ${data.weather[0].description}`;
    icon.src = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    minmax.textContent = `MIN: ${data.main.temp_min} °C ||| MAX: ${data.main.temp_max} °C`;

    city.classList.add('city-class');
    flag.classList.add('flag-class');
    temp.classList.add('temp-class');
    main.classList.add('main-class');
    icon.classList.add('icon-class');
    minmax.classList.add('min-class');
    roots.classList.add('roots-class');
    cityContainer.classList.add('city-container')
    mainContainer.classList.add('main-container');
    
    cityContainer.append(flag, city);
    mainContainer.append(temp, main, minmax)
    roots.append(cityContainer, mainContainer, icon);
    output.innerHTML = ''
    output.appendChild(roots);
};

function ObtainCoords(data){
    const lat = data.lat;
    const lon = data.lon;
    AddMarker(lat,lon);
}

function AddMarker(lat, lon){
    console.log('Adding marker at :', lat, lon);
    const pinIcon = L.icon({
        iconUrl: 'images/RedPin.png',
        iconSize: [20,30],
        iconAnchor: [10,30],
    });
    if(previousMarker){map.removeLayer(previousMarker)};

    const markerLatLng = L.latLng(lat, lon);
    const marker = L.marker(markerLatLng, {icon: pinIcon}).addTo(map);
    map.setView([lat,lon], map.getZoom());
    previousMarker = marker;
}


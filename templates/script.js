function showContent(section) {
    document.querySelectorAll('.content > div').forEach(div => {
        div.classList.add('hidden');
    });
    document.getElementById(section).classList.remove('hidden');
}

document.querySelectorAll('.content > div').forEach(div => {
    if (div.id !== 'inicio') {
        div.classList.add('hidden');
    }
});

async function updateAndFetchData() {
    try {
        await fetch('/update-data'); // Actualiza data.json
        const response = await fetch('/data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const container = document.getElementById('data-container');
        container.innerHTML = ''; // Clear previous data

        if (data.length > 0) {
            const item = data[0];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');

            const temperatureDiv = document.createElement('div');
            temperatureDiv.classList.add('data-title');
            temperatureDiv.textContent = `Temperatura: ${item.temperatura}°C`;
            itemDiv.appendChild(temperatureDiv);

            const humidityDiv = document.createElement('div');
            humidityDiv.classList.add('data-title');
            humidityDiv.textContent = `Humedad: ${item.humedad}%`;
            itemDiv.appendChild(humidityDiv);

            const soilHumidityDiv = document.createElement('div');
            soilHumidityDiv.classList.add('data-title');
            soilHumidityDiv.textContent = `Humedad del Suelo: ${item.humedad_suelo}%`;
            itemDiv.appendChild(soilHumidityDiv);

            if (item.timestamp) {
                const timestampDiv = document.createElement('div');
                timestampDiv.classList.add('data-title');
                timestampDiv.textContent = `Hora registrada: ${item.timestamp}`;
                itemDiv.appendChild(timestampDiv);
            }

            container.appendChild(itemDiv);
        } else {
            container.textContent = 'No data available';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchWeatherData() {
    try {
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Ovalle&appid=1ef0ca182efbf978e8ae8d643846e536&units=metric&lang=es');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const weatherData = await response.json();
        const climateContainer = document.getElementById('climate-container');
        climateContainer.innerHTML = ''; // Clear previous data

        const cityDiv = document.createElement('div');
        cityDiv.textContent = `Ciudad: ${weatherData.name}`;
        climateContainer.appendChild(cityDiv);

        const tempDiv = document.createElement('div');
        tempDiv.textContent = `Temperatura: ${weatherData.main.temp}°C`;
        climateContainer.appendChild(tempDiv);

        const windDiv = document.createElement('div');
        windDiv.textContent = `Velocidad del viento: ${weatherData.wind.speed} m/s`;
        climateContainer.appendChild(windDiv);

        const descriptionDiv = document.createElement('div');
        descriptionDiv.textContent = `Descripción: ${weatherData.weather[0].description}`;
        climateContainer.appendChild(descriptionDiv);

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function updateLast15Data() {
    try {
        await fetch('/update-last-15-data'); // Actualiza last_15_data.json
        const response = await fetch('/last_15_data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const ctx = document.getElementById('data-chart').getContext('2d');
        
        const labels = data.map(item => item.timestamp);
        const temperatureData = data.map(item => item.temperatura);
        const humidityData = data.map(item => item.humedad);
        const soilHumidityData = data.map(item => item.humedad_suelo);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: temperatureData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                    },
                    {
                        label: 'Humedad (%)',
                        data: humidityData,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false,
                    },
                    {
                        label: 'Humedad del Suelo (%)',
                        data: soilHumidityData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha y Hora'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching last 15 records:', error);
    }
}

// Llama a la función para actualizar y obtener datos cuando se cargue la página
updateAndFetchData();
fetchWeatherData();
updateLast15Data();

// Actualiza los datos cada 5 segundos
setInterval(updateAndFetchData, 5000);
setInterval(fetchWeatherData, 60000); // Obtén datos del clima cada 60 segundos
setInterval(updateLast15Data, 60000); // Actualiza el gráfico cada 60 segundos

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT22.h>

// Configuración del sensor DHT22
#define DHTPIN 4 // Pin donde está conectado el DHT22
DHT22 dht22(DHTPIN);

// Configuración del sensor de humedad del suelo
const int humsuelo = 34; // Pin donde está conectado el sensor de humedad del suelo

// Configuración de la red WiFi
const char* ssid = "kek";
const char* password = "alo12345";

// Configuración del servidor
const char* serverName = "http://192.168.180.47:3000/insertar_datos";

void setup() {
  Serial.begin(115200);
  Serial.println("\ntest capteur DTH22");

  // Configuración del pin del sensor de humedad del suelo
  pinMode(humsuelo, INPUT);

  // Conectar a la red WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("Conectado a WiFi");
}

void loop() {
  // Leer datos del DHT22
  float temperatura = dht22.getTemperature();
  float humedad = dht22.getHumidity();

  if (dht22.getLastError() != dht22.OK) {
    Serial.print("last error :");
    Serial.println(dht22.getLastError());
    return;
  }

  // Leer datos del sensor de humedad del suelo
  int valHumsuelo = analogRead(humsuelo);
  int humedadSuelo = map(valHumsuelo, 4095, 0, 0, 100); // Convertir el valor en porcentaje

  // Mostrar datos en el Serial Monitor
  Serial.print("Temperatura: "); Serial.print(temperatura, 1); Serial.print("°C\t");
  Serial.print("Humedad: "); Serial.print(humedad, 1); Serial.print("%\t");
  Serial.print("Humedad del suelo: "); Serial.print(humedadSuelo); Serial.println("%");

  // Enviar datos al servidor
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String postData = "{\"temperatura\":" + String(temperatura) + ",\"humedad\":" + String(humedad) + ",\"humedad_suelo\":" + String(humedadSuelo) + "}";

    int httpResponseCode = http.POST(postData);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error en la solicitud HTTP: ");
      Serial.println(httpResponseCode);
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  } else {
    Serial.println("Error en la conexión WiFi");
  }

  // Esperar 10 segundos antes de la próxima lectura
  delay(60000);
}

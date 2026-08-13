require('dotenv').config(); // Ładuje zmienne z pliku .env
const express = require('express');
const app = express();

// Pobiera PORT z pliku .env, a jeśli go nie ma, domyślnie używa 3000
const PORT = process.env.PORT || 3000; 

app.use(express.json());

// Przykład użycia klucza: process.env.SECRET_KEY

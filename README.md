# Sistema Académico - Frontend

Frontend del Sistema de Gestión Académica desarrollado con Vue.js y Vite.
Este proyecto consume APIs desarrolladas en Laravel y Django, permitiendo gestionar información académica como estudiantes, notas, asistencias y reportes.


## 🚀 Librerias  utilizadas

A continuación se muestran algunas de las principales librerías utilizadas en el desarrollo del frontend del sistema académico.

| Libreria | Descripción |
|------------|-------------|
| **Axios** | Cliente HTTP utilizado para consumir las APIs del backend. |
| **SweetAlert2** | Librería para mostrar alertas y confirmaciones modernas dentro de la interfaz de usuario. |
| **vue-qrcode-reader** | Permite leer códigos QR utilizando la cámara del dispositivo. |
| **ExcelJS** | Generación y exportación de archivos Excel desde el sistema.
---


## Variables de entorno
Crear un archivo .env en la raíz del proyecto:
```bash
VITE_API_URL ='htp://localhost:8000/apit'
VITE_API_URL_DJANGO ='http://localhost:8001/api'
VITE_ROLE_KEY = 'clave_secreta'
```


## Comandos basicos
```bash
npm install     # instalar dependencias
npm run dev     # ejecutar en modo desarrollo
npm run build   # construir versión de producción
```


### Iconos usados
### Graficos
<CIcon icon="cil-chart" />
<CIcon icon="cil-chart-line" />
<CIcon icon="cil-chart-pie" />

### Reportes
<CIcon icon="cil-chart-pie" />
<CIcon icon="cil-file" />
<CIcon icon="cil-list" />
<CIcon icon="cil-history" />
<CIcon icon="cil-graph" />


## Autores
``` bash
1. Percy Geronimo 
2. Alfredo Lezcano
```





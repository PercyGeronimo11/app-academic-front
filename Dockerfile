FROM node:9.11.1-alpine

# instalar un simple servidor http para servir nuestro contenido estático
RUN npm install -g http-server

# hacer la carpeta 'app' el directorio de trabajo actual
WORKDIR /app

# copiar 'package.json' y 'package-lock.json' (si están disponibles)
COPY package*.json ./

# instalar dependencias del proyecto
RUN npm install

# copiar los archivos y carpetas del proyecto al directorio de trabajo actual (es decir, la carpeta 'app')
COPY . .

# construir aplicación para producción minificada
RUN npm run build

EXPOSE 8080
CMD [ "http-server", "dist" ]

# # Usa una imagen base de Nginx para servir la aplicación
# FROM nginx:alpine

# # Usa una imagen base de Nginx para servir la aplicación
# WORKDIR /usr/share/nginx/html

# # Copia los archivos de la fase de construcción al directorio donde Nginx los servirá
# COPY dist/ .

# # Copia el archivo de configuración de Nginx
# COPY nginx.conf /etc/nginx/nginx.conf

# # Exponemos el puerto 80 que usará Nginx dentro del contenedor
# EXPOSE 80

# # Comando por defecto para ejecutar Nginx
# CMD ["nginx", "-g", "daemon off;"]

# Base image (la imagen base sobre la que construiremos)
FROM node:18-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el package.json y lock.json para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . .

# Construimos la aplicación Vue
RUN npm run build

# Exponemos el puerto donde se servirá la aplicación (ajusta según tu configuración)
EXPOSE 8080

# Comando para iniciar la aplicación (ajusta según tu configuración)
CMD ["npm", "start"]

# # Usa una imagen base de Node.js 
# FROM node:18 AS build

# # Establece el directorio de trabajo
# WORKDIR /app

# # Copia los archivos del proyecto al contenedor
# COPY package*.json ./

# # Copia los archivos del proyecto
# COPY . .

# #instalar dependencias
# RUN npm install

# # Copia el archivo .env.dev al contenedor y renómbralo a .env
# COPY .env.dev .env

# # Construye la aplicación Vue.js (esto tomará las variables del archivo .env)
# RUN npm run build

# # Usa una imagen base de Nginx para servir la aplicación
# FROM nginx:alpine

# # Copia los archivos generados en la fase de construcción a la carpeta de Nginx
# COPY --from=build /app/dist /usr/share/nginx/html

# # Copia el archivo de configuración de Nginx<
# COPY nginx.conf /etc/nginx/nginx.conf

# # Expone el puerto 80
# EXPOSE 80

# # Comando por defecto para ejecutar Nginx
# CMD ["nginx", "-g", "daemon off;"]

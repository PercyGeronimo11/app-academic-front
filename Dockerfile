# Usa una imagen base de Node.js 
FROM node:18 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY package*.json ./
RUN npm install

# Copia los archivos del proyecto, incluyendo el archivo de entorno de producción
COPY . .

# Asegúrate de que Vite use el archivo de entorno correcto
COPY .env.production .env

# Construye la aplicación Vue.js (esto tomará las variables del archivo .env)
RUN npm run build

# Usa una imagen base de Nginx para servir la aplicación
FROM nginx:alpine

# Copia los archivos generados en la fase de construcción a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia el archivo de configuración de Nginx<
COPY nginx.conf /etc/nginx/nginx.conf

# Expone el puerto 80
EXPOSE 80

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]

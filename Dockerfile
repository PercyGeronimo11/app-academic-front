# Usa una imagen base de Nginx para servir la aplicación
FROM nginx:alpine

# Usa una imagen base de Nginx para servir la aplicación
WORKDIR /usr/share/nginx/html

# Copia los archivos de la fase de construcción al directorio donde Nginx los servirá
COPY dist/ .

# Copia el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto 80 que usará Nginx dentro del contenedor
EXPOSE 80

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]

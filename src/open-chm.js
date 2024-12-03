import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
    install(app) {
        window.addEventListener('keydown', function (event) {
            if (event.key === 'F1') {
                event.preventDefault();
                
                axios.get(`${API_URL}/open-chm`)
                    .then(() => {
                        console.log('Solicitud para abrir el archivo CHM enviada con éxito.');
                    })
                    .catch((error) => {
                        console.error('Error al intentar abrir el archivo CHM:', error);
                    });
            }
        });
    }
};
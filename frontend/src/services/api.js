import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na requisição:', error);
    
    if (error.response?.status === 500) {
      alert('Erro interno do servidor. Tente novamente.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

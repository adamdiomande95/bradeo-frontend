import axios from 'axios';

const API = axios.create({
  baseURL: 'https://bradeo-backend.onrender.com',
});

export const getAnnonces = () => API.get('/annonces');
export const getAnnonce = (id) => API.get(`/annonces/${id}`);
export const createAnnonce = (data) => API.post('/annonces', data);
export const createUser = (data) => API.post('/users', data);
export const sendMessage = (data) => API.post('/messages', data);
export const getMessages = (id) => API.get(`/messages/${id}`);
export const addFavori = (data) => API.post('/favoris', data);
export const sendOffre = (data) => API.post('/offres', data);
export const uploadPhoto = (formData) => API.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const register = (data) => API.post('/auth/register', data);
export const verifyOtp = (data) => API.post('/auth/verify', data);

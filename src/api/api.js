import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3006/api"
});

export default api;
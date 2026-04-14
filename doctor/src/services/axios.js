
import axios from "axios";

const baseURL = "https://medihub-backend-m32h.onrender.com/api";

 const publicApi = axios.create({ baseURL });

export default publicApi;
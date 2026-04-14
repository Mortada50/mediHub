
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://medihub-backend-m32h.onrender.com/api";

 const publicApi = axios.create({ baseURL });

export default publicApi;
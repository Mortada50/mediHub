
import publicApi from "./axios.js";

// upload doctor license
export async function uploadLicense(file) {
  const formData = new FormData();
  formData.append("license", file);

  const endpoint = "/upload/doctor-license";


  const res = await publicApi.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  
  });
  return res.data.data.url;
}
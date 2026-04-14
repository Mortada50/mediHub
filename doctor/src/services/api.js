
import publicApi from "./axios.js";

// upload doctor license
export async function uploadLicense(file) {
  const formData = new FormData();
  formData.append("license", file);

  const endpoint = "/upload/doctor-license";


  const res = await publicApi.post(endpoint, formData);
  return res.data.data.url;
}
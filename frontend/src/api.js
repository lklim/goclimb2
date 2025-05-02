import axios from "axios";

const API_BASE_URL = "/api"; // Proxy to Django

export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

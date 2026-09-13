import api from "./axiosInstance"; // Adjust to your existing Axios instance path

export const fetchCustomComponents = async () => {
  const response = await api.get("/api/custom-components");
  return response.data.components;
};

export const createCustomComponent = async (componentData) => {
  const response = await api.post("/api/custom-components", componentData);
  return response.data.component;
};

export const updateCustomComponent = async (id, componentData) => {
  const response = await api.put(`/api/custom-components/${id}`, componentData);
  return response.data.component;
};

export const deleteCustomComponent = async (id) => {
  const response = await api.delete(`/api/custom-components/${id}`);
  return response.data;
};
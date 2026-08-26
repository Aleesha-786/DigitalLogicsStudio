import axios from "axios";
import { resolveAiBaseUrl, resolveCircuitAiBaseUrl } from "../config/apiConfig";

function attachErrorInterceptor(client, unreachableMessage, unauthorizedMessage) {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.data?.error) {
        error.message = error.response.data.error;
      } else if (error.response?.status === 401) {
        error.message = unauthorizedMessage;
      } else if (!error.response) {
        error.message = unreachableMessage;
      }
      return Promise.reject(error);
    },
  );
  return client;
}

const aiClient = attachErrorInterceptor(
  axios.create({
    baseURL: resolveAiBaseUrl(),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 60000,
  }),
  "Cannot reach BoolMentor. Make sure the backend server is running.",
  "Please log in to use BoolMentor.",
);

const circuitAiClient = attachErrorInterceptor(
  axios.create({
    baseURL: resolveCircuitAiBaseUrl(),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 60000,
  }),
  "Cannot reach the circuit generator. Make sure the DLS backend is running on port 5000.",
  "Please log in to generate a circuit.",
);

export const sendChatMessage = (message, context) =>
  aiClient.post("/chat", { message, context });

export const requestCircuitHint = (payload) =>
  circuitAiClient.post("/hint", payload);

export const generateAiCircuit = (payload) =>
  circuitAiClient.post("/generate-circuit", payload);

export default aiClient;

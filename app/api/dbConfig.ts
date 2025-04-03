import { ConnectionConfiguration } from "tedious";

const config: ConnectionConfiguration = {
  server: process.env.BD_HOST || "",
  authentication: {
    type: "default",
    options: {
      userName: process.env.BD_USER || "",
      password: process.env.BD_PASSWORD || "",
    },
  },
  options: {
    requestTimeout: 30000,
    connectTimeout: 30000,
    database: process.env.BD_NAME || "",
    encrypt: true,
    trustServerCertificate: true,
    cryptoCredentialsDetails: {
      minVersion: "TLSv1.2",
    },
  },
};

export default config;

import { ConnectionConfiguration } from "tedious";

const config: ConnectionConfiguration = {
  server: "192.168.46.88",
  authentication: {
    type: "default",
    options: {
      userName: "saberes",
      password: "Pass.1234",
    },
  },
  options: {
    requestTimeout: 30000,
    connectTimeout: 30000,
    database: "saberes",
    encrypt: false,
    trustServerCertificate: true,
    cryptoCredentialsDetails: {
      minVersion: "TLSv1.2",
    },
  },
};

export default config;

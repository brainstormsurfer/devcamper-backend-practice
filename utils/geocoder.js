import dotenv from 'dotenv';
// Fix bug that the geocoder is not able to pick up the environment variables
dotenv.config({ path: "./config/config.env" });

import NodeGeocoder from "node-geocoder";


const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

export default geocoder;

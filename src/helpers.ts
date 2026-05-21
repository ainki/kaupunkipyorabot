import 'dotenv/config'

const digitransitApiUrl = 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1/?digitransit-subscription-key=' + process.env.DIGITRANSIT_KEY;
const startKeyboard = [
  [
    { text: "/asema" },
    { text: "Sijaintisi mukaan 📍", request_location: true },
  ],
];

export { digitransitApiUrl, startKeyboard };
import admin from 'firebase-admin';
const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });

const token = (await admin.app().options.credential.getAccessToken()).access_token;
const res = await fetch('https://texttospeech.googleapis.com/v1/voices?languageCode=en-US', {
  headers: { Authorization: 'Bearer ' + token }
});
const data = await res.json();
const chirp = data.voices.filter(v => v.name.includes('Chirp3-HD'));
chirp.forEach(v => console.log(v.name, v.ssmlGender));

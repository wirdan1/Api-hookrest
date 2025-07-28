const axios = require('axios');

const API_URL = 'https://api-partner.krl.co.id';
const API_TOKEN = 'Bearer ...'; // ← ganti token kamu di sini

const HEADERS = {
  'Authorization': API_TOKEN,
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
};

async function getAllStations() {
  try {
    const response = await axios.get(`${API_URL}/krl-webs/v1/krl-station`, { headers: HEADERS });
    return response.data.data || [];
  } catch (error) {
    console.error("Gagal mengambil stasiun:", error.message);
    return [];
  }
}

async function getStationId(name) {
  const stations = await getAllStations();
  return stations.find(st => st.sta_name.toLowerCase().includes(name.toLowerCase()));
}

async function infoRoute() {
  const data = await getAllStations();
  if (!data.length) {
    return { status: false, message: "Data stasiun tidak ditemukan", code: 404 };
  }
  return { status: true, data, code: 200 };
}

async function tarifKereta(origin, destination) {
  const [from, to] = await Promise.all([getStationId(origin), getStationId(destination)]);
  if (!from || !to) {
    return { status: false, message: "Stasiun tidak ditemukan", code: 404 };
  }

  try {
    const res = await axios.get(
      `${API_URL}/krl-webs/v1/fare?stationfrom=${from.sta_id}&stationto=${to.sta_id}`,
      { headers: HEADERS }
    );

    const fare = res.data.data?.[0];
    return {
      status: true,
      data: {
        from: from.sta_name,
        to: to.sta_name,
        fare: fare?.fare,
        distance: fare?.distance
      },
      code: 200
    };
  } catch (error) {
    return { status: false, message: "Gagal mengambil tarif", code: 500 };
  }
}

async function jadwalKereta(station, fromTime, toTime) {
  const st = await getStationId(station);
  if (!st) return { status: false, message: "Stasiun tidak ditemukan", code: 404 };

  try {
    const res = await axios.get(
      `${API_URL}/krl-webs/v1/schedule?stationid=${st.sta_id}&timefrom=${fromTime}&timeto=${toTime}`,
      { headers: HEADERS }
    );

    return {
      status: true,
      data: res.data.data || [],
      code: 200
    };
  } catch (error) {
    return { status: false, message: "Gagal mengambil jadwal", code: 500 };
  }
}

module.exports = {
  infoRoute,
  tarifKereta,
  jadwalKereta
};

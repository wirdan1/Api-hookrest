const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = 'https://api-partner.krl.co.id';
const API_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDYzNWIy...'; // Potong demi keamanan

const HEADERS = {
  'Authorization': API_TOKEN,
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
};

// Ambil semua stasiun
async function getAllStations() {
  try {
    const response = await axios.get(`${API_URL}/krl-webs/v1/krl-station`, { headers: HEADERS });
    return response.data.data || [];
  } catch (error) {
    return [];
  }
}

// Ambil data stasiun berdasarkan nama
async function getStationId(stationName) {
  if (!stationName) return null;
  const stations = await getAllStations();
  return stations.find(station =>
    station.sta_name.toLowerCase().includes(stationName.toLowerCase())
  );
}

// Endpoint: GET /krl/route
app.get('/krl/route', async (req, res) => {
  try {
    const stations = await getAllStations();
    if (!stations.length) {
      return res.status(404).json({ status: false, message: 'Data stasiun tidak ditemukan' });
    }

    const result = stations.map(st => ({
      id: st.sta_id,
      name: st.sta_name,
      code: st.sta_code
    }));

    res.json({ status: true, message: 'Daftar stasiun', data: result });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Gagal mengambil data stasiun', error: err.message });
  }
});

// Endpoint: GET /krl/tarif?from=Bogor&to=Bekasi
app.get('/krl/tarif', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ status: false, message: 'Parameter ?from= dan ?to= wajib diisi' });
  }

  try {
    const [origin, destination] = await Promise.all([
      getStationId(from),
      getStationId(to)
    ]);

    if (!origin || !destination) {
      return res.status(404).json({ status: false, message: 'Stasiun tidak ditemukan' });
    }

    const response = await axios.get(
      `${API_URL}/krl-webs/v1/fare?stationfrom=${origin.sta_id}&stationto=${destination.sta_id}`,
      { headers: HEADERS }
    );

    const fareData = response.data.data?.[0];
    if (!fareData) {
      return res.json({ status: false, message: 'Tarif tidak tersedia untuk rute ini' });
    }

    res.json({
      status: true,
      message: 'Tarif ditemukan',
      data: {
        from: origin.sta_name,
        to: destination.sta_name,
        price: fareData.fare,
        distance: fareData.distance + ' km'
      }
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Gagal mengambil tarif', error: err.message });
  }
});

// Endpoint: GET /krl/jadwal?station=Bogor&from=06:00&to=09:00
app.get('/krl/jadwal', async (req, res) => {
  const { station, from, to } = req.query;
  if (!station || !from || !to) {
    return res.status(400).json({ status: false, message: 'Parameter ?station=, ?from=, dan ?to= wajib diisi' });
  }

  try {
    const stationData = await getStationId(station);
    if (!stationData) {
      return res.status(404).json({ status: false, message: 'Stasiun tidak ditemukan' });
    }

    const response = await axios.get(
      `${API_URL}/krl-webs/v1/schedule?stationid=${stationData.sta_id}&timefrom=${from}&timeto=${to}`,
      { headers: HEADERS }
    );

    const schedules = response.data.data;
    if (!schedules || schedules.length === 0) {
      return res.json({ status: false, message: 'Tidak ada jadwal tersedia di waktu tersebut' });
    }

    const data = schedules.map((s, i) => ({
      no: i + 1,
      train_name: s.ka_name,
      destination: s.dest,
      depart: s.time_est,
      arrive: s.dest_time
    }));

    res.json({
      status: true,
      message: `Jadwal di ${stationData.sta_name}`,
      data
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Gagal mengambil jadwal', error: err.message });
  }
});

app.get('/', (_, res) => {
  res.send('🚆 API KRL siap digunakan!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

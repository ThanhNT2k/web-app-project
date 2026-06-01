const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');

async function testUpload() {
  try {
    const token = jwt.sign(
      {
        id: 1,
        username: 'admin',
        email: 'admin@cmctruyen.vn',
        role: 'Admin',
        full_name: 'Quản Trị Viên',
      },
      'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );
    console.log('Login successful using direct JWT');

    const dummyPath = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(dummyPath, 'fake image content');

    const form = new FormData();
    form.append('cover', fs.createReadStream(dummyPath));

    const uploadRes = await axios.post('http://localhost:5000/api/upload/cover', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload success:', uploadRes.data);
  } catch (e) {
    console.error('Upload failed:', e.response?.data || e.message);
  }
}
testUpload();

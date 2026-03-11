
const API = 'https://federated-socialnetw.onrender.com/api';

async function testLogin(email, password) {
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log('LOGIN_TEST:', data);
  } catch(e) {
    console.log('LOGIN_ERROR:', e.message);
  }
}

// Test with the admin I just created
testLogin('admins@gmail.com', 'admins123');

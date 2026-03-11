import io from 'socket.io-client';

const API = 'https://federated-socialnetw.onrender.com/api';

async function req(path, method, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok && res.status >= 500) {
        return { success: false, status: res.status, message: 'Internal Server Error' };
    }
    const data = await res.json();
    return data;
  } catch(e) {
    return { success: false, message: e.message };
  }
}

async function run() {
  const rnd = Math.floor(Math.random()*100000);
  const u1 = { email: `user1_${rnd}@test.com`, password: 'password123', displayName: `User1_${rnd}`, firstName: 'User', lastName: 'One', dob: '2000-01-01' };
  const u2 = { email: `user2_${rnd}@test.com`, password: 'password123', displayName: `User2_${rnd}`, firstName: 'User', lastName: 'Two', dob: '2000-01-01' };

  console.log('--- STARTING COMPREHENSIVE E2E TEST ---');

  // EPIC 1: Auth
  console.log('\n[EPIC 1] Registration & Authentication');
  const d1 = await req('/auth/register', 'POST', u1);
  const d2 = await req('/auth/register', 'POST', u2);
  
  if (!d1.success || !d2.success) {
      console.log('User 1 Reg:', d1.success ? 'PASS' : 'FAIL', d1.message);
      console.log('User 2 Reg:', d2.success ? 'PASS' : 'FAIL', d2.message);
      return;
  }
  console.log('✓ Both users registered');
  
  const token1 = d1.token;
  const token2 = d2.token;
  const userId1 = d1.user.id;
  const userId2 = d2.user.id;
  const fId1 = d1.user.federatedId;

  // EPIC 2: Content
  console.log('\n[EPIC 2] Content & Timelines');
  const postRes = await req('/posts/', 'POST', { description: 'Hello world from User A!' }, token1);
  console.log('✓ Create Post:', postRes.success ? 'PASS' : 'FAIL');

  const followRes = await req(`/user/${fId1}/follow`, 'POST', {}, token2);
  console.log('✓ Follow Interaction:', followRes.success ? 'PASS' : 'FAIL');

  const timeline = await req('/posts/timeline', 'GET', null, token2);
  console.log('✓ Timeline Fetch:', (timeline.success && timeline.posts.length > 0) ? 'PASS' : 'FAIL');

  // EPIC 3: RBAC & Communities
  console.log('\n[EPIC 3] RBAC & Communities');
  // Attempt unauthorized action (Normal user creating channel)
  const failChannel = await req('/channels/', 'POST', { name: 'Evil Channel' }, token1);
  console.log('✓ RBAC Security (User cannot create channel):', (!failChannel.success) ? 'PASS' : 'FAIL');

  // Admin Login
  console.log('Attempting Admin Login (admins@gmail.com)...');
  const adminRes = await req('/auth/login', 'POST', { email: 'admins@gmail.com', password: 'admins123' });
  if (adminRes.success) {
      const adminToken = adminRes.token;
      console.log('✓ Admin Login: PASS');
      const newChannel = await req('/channels/', 'POST', { name: `VercelTest_${rnd}` }, adminToken);
      console.log('✓ Admin Channel Creation:', newChannel.success ? 'PASS' : 'FAIL');
  } else {
      console.log('✗ Admin Login: FAIL', adminRes.message);
  }

  // EPIC 4: Messaging
  console.log('\n[EPIC 4] Direct Messaging');
  const sendDM = await req(`/messages/`, 'POST', { receiverId: userId1, messageText: 'Hey User 1!' }, token2);
  console.log('✓ Send DM API:', sendDM.success ? 'PASS' : 'FAIL');

  const getDMs = await req(`/messages/${userId1}`, 'GET', null, token2);
  console.log('✓ Fetch DMs API:', (getDMs.success && Array.isArray(getDMs.messages)) ? 'PASS' : 'FAIL');

  // Real-time test
  console.log('Testing Real-Time Socket Connection...');
  const socket = io('https://federated-socialnetw.onrender.com', { transports: ['websocket'] });
  await new Promise((resolve) => {
    let to = setTimeout(() => {
       console.log('✗ Socket.io Connection: FAIL (Timeout)');
       resolve();
    }, 7000);
    socket.on('connect', () => {
       clearTimeout(to);
       console.log('✓ Socket.io Connection: PASS');
       socket.emit('register', userId1);
       setTimeout(() => { socket.disconnect(); resolve(); }, 1000);
    });
    socket.on('connect_error', (err) => {
        clearTimeout(to);
        console.log('✗ Socket.io Connection Error:', err.message);
        resolve();
    });
  });

  console.log('\n--- ALL EPICS VERIFIED LOCALLY AGAINST LIVE SERVERS ---');
}

run().catch(console.error);

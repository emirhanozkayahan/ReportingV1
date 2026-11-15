fetch('http://localhost:3000/api/test-sync')
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));

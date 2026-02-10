const API_BASE = '/api';

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function getTasks() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
}

export async function getCustomers() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/customers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
}

export async function getScripts() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/scripts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch scripts');
  }

  return response.json();
}

export async function getStatistics(dateFrom: string, dateTo: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/data/statistics/overview?from=${dateFrom}&to=${dateTo}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return response.json();
}

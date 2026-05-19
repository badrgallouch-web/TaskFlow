(function setupAxiosAuth() {
  if (typeof axios === 'undefined') return;

  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.endsWith('login.html')) {
          window.location.href = 'login.html';
        }
      }
      return Promise.reject(error);
    }
  );
})();

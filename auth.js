(function () {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  if (!loginForm || !signupForm || !window.NutriApp) return;

  const loginStatus = document.getElementById('login-status');
  const signupStatus = document.getElementById('signup-status');

  function setStatus(node, text, ok) {
    node.textContent = text;
    node.className = `status-msg ${ok ? 'status-ok' : 'status-err'}`;
  }

  const activeUser = NutriApp.getCurrentUser();
  if (activeUser) {
    setStatus(loginStatus, `You are currently logged in as ${activeUser.name || activeUser.email}.`, true);
  }

  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (mode === 'signup') {
    document.getElementById('signup-name').focus();
  } else {
    document.getElementById('login-email').focus();
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const result = NutriApp.login(email, password);

    if (!result.ok) {
      setStatus(loginStatus, result.error, false);
      return;
    }

    setStatus(loginStatus, 'Login successful. Redirecting...', true);

    const next = params.get('next') || './assessment.html';
    setTimeout(() => {
      window.location.href = next;
    }, 450);
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (password !== confirm) {
      setStatus(signupStatus, 'Passwords do not match.', false);
      return;
    }

    const result = NutriApp.createAccount({ name, email, password });
    if (!result.ok) {
      setStatus(signupStatus, result.error, false);
      return;
    }

    setStatus(signupStatus, 'Account created. Please log in to start saving reports.', true);
    signupForm.reset();
    document.getElementById('login-email').value = result.account.email;
    document.getElementById('login-email').focus();
  });
})();

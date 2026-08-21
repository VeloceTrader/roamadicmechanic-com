(function () {
  'use strict';

  const OWNER_EMAIL = 'robert@roamadicmechanic.com';
  const SUPABASE_URL = 'https://rnozbhxadrpkaxggjlks.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_lP6zq23Nqj22NAfQs0bMew_4cXvmtYS';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, experimental: { passkey: true } }
  });
  window.rmSupabase = sb;

  let resolveReady;
  window.rmAuthReady = new Promise(function (resolve) { resolveReady = resolve; });

  const style = document.createElement('style');
  style.textContent = '.rm-auth{position:fixed;inset:0;z-index:1000;background:#eee8da;display:flex;align-items:center;justify-content:center;padding:18px}.rm-auth-card{width:min(420px,100%);background:#fff;border:1px solid #ddd6c6;border-radius:16px;padding:24px;box-shadow:0 18px 50px rgba(18,40,59,.18)}.rm-auth-card h2{color:#1c3a52;margin:0 0 6px}.rm-auth-card p{color:#6b7280;font-size:13px;line-height:1.45}.rm-auth-card label{display:block;font-size:11px;font-weight:800;text-transform:uppercase;color:#6b7280;margin:14px 0 5px}.rm-auth-card input{width:100%;padding:12px;border:1px solid #ddd6c6;border-radius:8px;background:#f6f1e6;font-size:15px}.rm-auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.rm-auth-msg{min-height:20px;margin-top:12px;font-size:12px}.rm-signout{position:absolute;right:16px;top:16px;background:#fff;border:1px solid #ddd6c6;border-radius:8px;padding:8px 11px;color:#1c3a52;font-weight:700;cursor:pointer}';
  document.head.appendChild(style);

  function showLogin(message) {
    let gate = document.getElementById('rm-auth');
    if (!gate) {
      gate = document.createElement('div');
      gate.id = 'rm-auth';
      gate.className = 'rm-auth';
      gate.innerHTML = '<div class="rm-auth-card"><h2>Shop Dashboard</h2><p>Private access for Roamadic Mechanic.</p><button class="btn btn-primary btn-wide" id="rm-passkey-signin">Sign in with fingerprint / passkey</button><label>Email</label><input id="rm-auth-email" type="email" autocomplete="username" readonly><label>Password</label><input id="rm-auth-password" type="password" autocomplete="current-password"><div class="rm-auth-actions"><button class="btn btn-primary" id="rm-signin">Sign In</button><button class="btn btn-ghost" id="rm-signup">Create Account</button></div><button class="btn btn-ghost btn-wide" id="rm-reset" style="margin-top:8px">Reset Password</button><div class="rm-auth-msg" id="rm-auth-msg"></div></div>';
      document.body.appendChild(gate);
      gate.querySelector('#rm-auth-email').value = OWNER_EMAIL;
      gate.querySelector('#rm-signin').onclick = function () { authenticate(false); };
      gate.querySelector('#rm-signup').onclick = function () { authenticate(true); };
      gate.querySelector('#rm-reset').onclick = requestReset;
      gate.querySelector('#rm-passkey-signin').onclick = signInWithPasskey;
      gate.querySelector('#rm-auth-password').addEventListener('keydown', function (e) { if (e.key === 'Enter') authenticate(false); });
    }
    gate.style.display = 'flex';
    gate.querySelector('#rm-auth-msg').textContent = message || '';
  }

  async function signInWithPasskey() {
    const msg = document.getElementById('rm-auth-msg');
    msg.textContent = 'Waiting for your fingerprint or device unlock…';
    const result = await sb.auth.signInWithPasskey();
    if (result.error) { msg.textContent = result.error.message; return; }
    await authorize(result.data.session);
  }

  async function requestReset() {
    const msg = document.getElementById('rm-auth-msg');
    msg.textContent = 'Sending password-reset email…';
    const result = await sb.auth.resetPasswordForEmail(OWNER_EMAIL, { redirectTo: location.origin + location.pathname });
    msg.textContent = result.error ? result.error.message : 'Reset email sent. Open it, then return here to choose a new password.';
  }

  function showRecovery() {
    showLogin('Enter a new strong password, then press Set New Password.');
    const gate = document.getElementById('rm-auth');
    gate.querySelector('#rm-signin').style.display = 'none';
    gate.querySelector('#rm-signup').style.display = 'none';
    gate.querySelector('#rm-reset').style.display = 'none';
    gate.querySelector('#rm-passkey-signin').style.display = 'none';
    const actions = gate.querySelector('.rm-auth-actions');
    actions.style.gridTemplateColumns = '1fr';
    let button = document.getElementById('rm-set-password');
    if (!button) {
      button = document.createElement('button');
      button.id = 'rm-set-password';
      button.className = 'btn btn-primary';
      button.textContent = 'Set New Password';
      button.onclick = async function () {
        const password = document.getElementById('rm-auth-password').value;
        const msg = document.getElementById('rm-auth-msg');
        if (password.length < 12) { msg.textContent = 'Use at least 12 characters.'; return; }
        const result = await sb.auth.updateUser({ password: password });
        document.getElementById('rm-auth-password').value = '';
        if (result.error) { msg.textContent = result.error.message; return; }
        location.replace(location.origin + location.pathname);
      };
      actions.appendChild(button);
    }
  }

  function hideLogin() {
    const gate = document.getElementById('rm-auth');
    if (gate) gate.style.display = 'none';
    if (!document.getElementById('rm-signout')) {
      const button = document.createElement('button');
      button.id = 'rm-signout';
      button.className = 'rm-signout';
      button.textContent = 'Sign out';
      button.onclick = async function () { await sb.auth.signOut(); location.reload(); };
      document.body.appendChild(button);
    }
    if (!document.getElementById('rm-register-passkey')) {
      const enroll = document.createElement('button');
      enroll.id = 'rm-register-passkey';
      enroll.className = 'btn btn-ghost btn-wide';
      enroll.style.marginTop = '8px';
      enroll.textContent = 'Register fingerprint / this device';
      enroll.onclick = async function () {
        enroll.disabled = true;
        enroll.textContent = 'Waiting for device security…';
        const result = await sb.auth.registerPasskey();
        enroll.disabled = false;
        enroll.textContent = result.error ? 'Passkey setup failed — try again' : 'Fingerprint / passkey registered';
      };
      const header = document.querySelector('.header');
      if (header) header.appendChild(enroll);
    }
  }

  async function authenticate(create) {
    const password = document.getElementById('rm-auth-password').value;
    const msg = document.getElementById('rm-auth-msg');
    if (password.length < 12) { msg.textContent = 'Use the strong password saved in Google Password Manager.'; return; }
    msg.textContent = create ? 'Creating your private owner account…' : 'Signing in…';
    const result = create
      ? await sb.auth.signUp({ email: OWNER_EMAIL, password: password, options: { emailRedirectTo: location.origin + location.pathname } })
      : await sb.auth.signInWithPassword({ email: OWNER_EMAIL, password: password });
    document.getElementById('rm-auth-password').value = '';
    if (result.error) { msg.textContent = result.error.message; return; }
    if (create && !result.data.session) { msg.textContent = 'Check your email and tap the confirmation link. Then return here and sign in.'; return; }
    await authorize(result.data.session);
  }

  async function authorize(session) {
    if (!session) { showLogin(''); return; }
    const membership = await sb.from('shop_members').select('shop_id, role').eq('user_id', session.user.id).maybeSingle();
    if (membership.error || !membership.data) {
      await sb.auth.signOut();
      showLogin('This account is not authorized for the shop dashboard.');
      return;
    }
    window.rmShopId = membership.data.shop_id;
    window.rmShopRole = membership.data.role;
    hideLogin();
    resolveReady(session);
  }

  sb.auth.onAuthStateChange(function (event) { if (event === 'PASSWORD_RECOVERY') setTimeout(showRecovery, 0); });
  sb.auth.getSession().then(function (result) { authorize(result.data.session); });
})();


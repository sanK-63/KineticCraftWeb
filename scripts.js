document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  const toggle = document.getElementById('theme-toggle');
  const icon = toggle ? toggle.querySelector('i') : null;
  
  if (toggle && icon) {
    if (localStorage.getItem('theme') === 'night') {
      document.body.classList.add('night-mode');
      icon.classList.replace('fa-moon', 'fa-sun');
    }

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('night-mode');
      
      if (document.body.classList.contains('night-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'night');
      } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'day');
      }
    });
  }

  updateServerStatus();
  setInterval(updateServerStatus, 60000);

  checkAuthStatus();
});

async function updateServerStatus() {
  const serverIP = '92.47.224.152';
  const onlineCount = document.getElementById('online');
  const serverStatusText = document.getElementById('server-status-text');
  
  if (!onlineCount) return;
  
  try {
    const response = await fetch(`https://api.mcstatus.io/v2/status/java/${serverIP}`);
    const data = await response.json();

    if (data.online) {
      if (serverStatusText) {
        serverStatusText.textContent = 'Сервер запущен';
      }
      onlineCount.textContent = `${data.players.online} / ${data.players.max}`;
      
      const statusIndicator = document.getElementById('status-indicator');
      if (statusIndicator) {
        statusIndicator.classList.add('online');
        statusIndicator.classList.remove('offline');
      }
    } else {
      if (serverStatusText) {
        serverStatusText.textContent = 'На техобслуживании';
      }
      onlineCount.textContent = '0 / 0';
      
      const statusIndicator = document.getElementById('status-indicator');
      if (statusIndicator) {
        statusIndicator.classList.add('offline');
        statusIndicator.classList.remove('online');
      }
    }
  } catch (error) {
    console.error('Ошибка при получении статуса:', error);
    onlineCount.textContent = '?';
  }
}

async function checkAuthStatus() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const profileLink = nav.querySelector('a[href="profile.html"]');
  const authLink = nav.querySelector('a[href="auth.html"]');

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(
      'https://enlcsziwdihbxtlvqxvv.supabase.co',
      'sb_publishable_QaAR-8mGn76W2qxzyucSOA_kKqDFsC0'
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      const username = profile?.username || session.user.email;
      
      if (authLink) authLink.style.display = 'none';
      if (profileLink) {
        profileLink.innerHTML = `<i class="fas fa-user"></i> ${username}`;
        profileLink.style.display = '';
      }
    } else {
      if (authLink) authLink.style.display = '';
      if (profileLink) profileLink.style.display = 'none';
    }
  } catch (err) {
    console.log('Auth check failed:', err);
    if (authLink) authLink.style.display = '';
    if (profileLink) profileLink.style.display = 'none';
  }
}
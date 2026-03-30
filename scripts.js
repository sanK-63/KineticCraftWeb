document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Theme toggle
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

  // Online count
  const onlineCount = document.getElementById('online');
  if (onlineCount) {
    fetch("https://api.mcstatus.io/v2/status/java/vip.play.kz")
      .then(res => res.json())
      .then(data => {
        onlineCount.textContent = data.players.online || '0';
      })
      .catch(() => {
        onlineCount.textContent = '0';
      });
  }

  // Check auth status
  checkAuthStatus();
});

async function checkAuthStatus() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(
      'https://enlcsziwdihbxtlvqxvv.supabase.co',
      'sb_publishable_QaAR-8mGn76W2qxzyucSOA_kKqDFsC0'
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Получаем данные профиля
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      const username = profile?.username || session.user.email;
      
      // Обновляем навигацию
      const authLink = nav.querySelector('a[href="auth.html"]');
      if (authLink) {
        authLink.innerHTML = `<i class="fas fa-user"></i> ${username}`;
        authLink.style.background = 'var(--accent)';
        authLink.style.color = '#000';
      }
    }
  } catch (err) {
    console.log('Auth check failed:', err);
  }
}

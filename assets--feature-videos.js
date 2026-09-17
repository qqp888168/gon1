(() => {
  const states = [];
  const section = document.querySelector('#home-learning-features');
  if (!section) return;

  function updateButton(state) {
    const playing = !state.video.paused && !state.video.ended;
    state.button.classList.toggle('is-playing', playing);
    state.button.setAttribute('aria-label', `${playing ? '暫停' : '播放'}影片：${state.title}`);
  }

  function start(state) {
    state.video.muted = true;
    const attempt = state.video.play();
    if (attempt) attempt.catch(() => updateButton(state));
  }

  function sync(state) {
    if (state.inView && !state.userPaused && !document.hidden) start(state);
    else state.video.pause();
  }

  section.querySelectorAll('.feature-video').forEach(video => {
    const card = video.closest('.feature-card');
    const state = {
      video,
      button: card.querySelector('.feature-video-toggle'),
      title: card.querySelector('.feature-title').textContent.trim(),
      inView: false,
      userPaused: false
    };
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (window.timelyAsset && video.dataset.posterFile) video.poster = window.timelyAsset(video.dataset.posterFile);
    video.addEventListener('play', () => updateButton(state));
    video.addEventListener('pause', () => updateButton(state));
    state.button.addEventListener('click', event => {
      event.stopPropagation();
      if (video.paused) {
        state.userPaused = false;
        start(state);
      } else {
        state.userPaused = true;
        video.pause();
      }
    });
    updateButton(state);
    states.push(state);
  });

  if ('IntersectionObserver' in window) {
    const byVideo = new Map(states.map(state => [state.video, state]));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state = byVideo.get(entry.target);
        state.inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        sync(state);
      });
    }, { threshold: [0, 0.2] });
    states.forEach(state => observer.observe(state.video));
  } else {
    states.forEach(state => { state.inView = true; sync(state); });
  }

  document.addEventListener('visibilitychange', () => states.forEach(sync));
})();

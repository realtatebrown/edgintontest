const interviewScreen = document.querySelector('.screen');
const playLink = interviewScreen.querySelector('.poster');

function playInterview(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.currentTarget;
  const watchUrl = new URL(link.href);
  const embedUrl = new URL(watchUrl.searchParams.get('v'), 'https://www.youtube-nocookie.com/embed/');
  embedUrl.searchParams.set('autoplay', '1');
  embedUrl.searchParams.set('playsinline', '1');
  const timestamp = watchUrl.searchParams.get('t');
  if (timestamp) embedUrl.searchParams.set('start', parseInt(timestamp, 10));

  event.preventDefault();
  const player = document.createElement('iframe');
  player.title = 'Christopher Caldwell in conversation with Steven Edginton';
  player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  player.allowFullscreen = true;
  player.src = embedUrl.href;
  interviewScreen.replaceChildren(player);
  player.focus();
}

playLink.addEventListener('click', playInterview);
document.querySelectorAll('.chapter-list a').forEach(link => link.addEventListener('click', playInterview));

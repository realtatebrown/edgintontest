const poster = document.querySelector('#play-film');

poster.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const videoId = new URL(poster.href).searchParams.get('v');
  const player = document.createElement('iframe');
  player.title = 'Christopher Caldwell in conversation with Steven Edginton';
  player.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&playsinline=1';
  player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  player.allowFullscreen = true;
  poster.replaceWith(player);
  player.focus();
});

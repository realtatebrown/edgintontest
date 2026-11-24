const room = document.createElement('dialog');
room.className = 'screening';
room.setAttribute('aria-labelledby', 'screening-title');
room.innerHTML = `
<div class="screening-inner">
  <div class="screening-head">
    <div class="screening-credit">
      <img class="screening-still" width="1400" height="750" alt="" hidden>
      <h2 id="screening-title"></h2>
    </div>
    <button type="button" class="screening-back" autofocus>Back to the front page</button>
  </div>
  <div class="screening-player"></div>
  <ol class="chapter-list" aria-label="Jump to a scene"></ol>
  <a class="watch-source" id="screening-source" href="https://www.youtube.com/@Steven.Edginton">Watch on YouTube</a>
</div>
`;
document.body.append(room);
const roomChapters = room.querySelector('.chapter-list');
const playerHost = room.querySelector('.screening-player');
const returnButton = room.querySelector('.screening-back');
const sourceLink = room.querySelector('#screening-source');
const screeningStill = room.querySelector('.screening-still');
let opener;
let scrollPosition;

const chapterStrip = document.querySelector('.chapter-strip');
if (chapterStrip) {
  const narrowCover = window.matchMedia('(max-width: 760px)');
  function setChapterLayout() {
    chapterStrip.open = !narrowCover.matches;
  }
  setChapterLayout();
  narrowCover.addEventListener('change', setChapterLayout);

  if (new URLSearchParams(location.search).get('cover') === 'quote') {
    document.querySelector('#lead-title a').textContent = '“It will never again be the same”';
  }
}

if (document.querySelector('.interview-index')) {
  returnButton.textContent = 'Back to interviews';
}

function setFilm(watchLink) {
  const url = new URL(watchLink.href);
  const embed = new URL(url.searchParams.get('v'), 'https://www.youtube-nocookie.com/embed/');
  embed.searchParams.set('autoplay', '1');
  embed.searchParams.set('playsinline', '1');
  const seconds = parseInt(url.searchParams.get('t'), 10);
  if (seconds > 0) embed.searchParams.set('start', seconds);

  const player = document.createElement('iframe');
  player.title = room.querySelector('h2').textContent;
  player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  player.allowFullscreen = true;
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  player.src = embed.href;
  playerHost.replaceChildren(player);
  sourceLink.href = url.href;
  for (const chapter of roomChapters.querySelectorAll('a')) {
    if (chapter.href === url.href) chapter.setAttribute('aria-current', 'true');
    else chapter.removeAttribute('aria-current');
  }
}

function loadChapters(film) {
  roomChapters.replaceChildren();
  for (const source of film.querySelectorAll('.chapter-list a[data-watch], .film-sequence a[data-watch]')) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const time = document.createElement('span');
    time.textContent = (source.querySelector('time') || source.firstElementChild).textContent;
    const label = source.querySelector('.chapter-name, .scene-title').textContent;
    link.href = source.href;
    link.setAttribute('data-watch', '');
    link.append(time, ' ', label);
    item.append(link);
    roomChapters.append(item);
  }
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[data-watch]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (typeof room.showModal !== 'function') return;
  event.preventDefault();
  if (!room.open) {
    const film = link.closest('article');
    opener = link;
    scrollPosition = {left: window.scrollX, top: window.scrollY};
    room.querySelector('h2').textContent = film.dataset.filmTitle || film.querySelector('h2').textContent;
    screeningStill.hidden = !film.dataset.screeningStill;
    if (film.dataset.screeningStill) screeningStill.src = film.dataset.screeningStill;
    else screeningStill.removeAttribute('src');
    loadChapters(film);
    room.showModal();
    room.scrollTop = 0;
    returnButton.focus({preventScroll: true});
  }
  setFilm(link);
});

returnButton.addEventListener('click', () => room.close());
room.addEventListener('close', () => {
  playerHost.replaceChildren();
  opener?.focus({preventScroll: true});
  if (scrollPosition) window.scrollTo(scrollPosition);
});

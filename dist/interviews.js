const list = document.querySelector('.guest-list');
const controls = document.querySelector('.index-sort');
const alphabetic = Array.from(list.children);
const newest = [...alphabetic].sort((a, b) =>
  b.querySelector('time').dateTime.localeCompare(a.querySelector('time').dateTime)
);

function displayOrder(order) {
  const byDate = order === 'newest';
  list.replaceChildren(...(byDate ? newest : alphabetic));
  for (const button of controls.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.order === (byDate ? 'newest' : 'az')));
  }
}

displayOrder(new URL(location.href).searchParams.get('sort'));
controls.hidden = false;
controls.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.getAttribute('aria-pressed') === 'true') return;
  const order = button.dataset.order;
  displayOrder(order);
  const url = new URL(location.href);
  if (order === 'newest') url.searchParams.set('sort', order);
  else url.searchParams.delete('sort');
  history.replaceState(null, '', url);
});

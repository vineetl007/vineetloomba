document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('mocktest-search');
  if (!input) return;
  const cards = Array.from(document.querySelectorAll('.mocktest-card'));

  input.addEventListener('input', function (e) {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      cards.forEach(c => c.style.display = '');
      return;
    }
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const match = title.includes(q) || tags.includes(q);
      card.style.display = match ? '' : 'none';
    });
  });
});

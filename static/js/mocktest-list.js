document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('mocktest-search');
  const select = document.getElementById('mocktest-filter');
  const cards = Array.from(document.querySelectorAll('.mocktest-card'));
  if (!cards.length) return;

  function normalizeTags(raw) {
    return (raw || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  }

  function filterCards() {
    const q = input ? input.value.trim().toLowerCase() : '';
    const sel = select ? select.value : '';
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const tagsArr = normalizeTags(card.dataset.tags);
      const tagsStr = tagsArr.join(' ');

      const matchQuery = !q || title.includes(q) || tagsStr.includes(q);
      const matchFilter = !sel || tagsArr.includes(sel);

      card.style.display = (matchQuery && matchFilter) ? '' : 'none';
    });
  }

  if (input) input.addEventListener('input', filterCards);
  if (select) select.addEventListener('change', filterCards);

  // initial filter (so dropdown default applies immediately)
  filterCards();
});

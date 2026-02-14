const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    // toggle active tab
    tabs.forEach(t => t.classList.remove('tab-active'));
    tab.classList.add('tab-active');

    // toggle content
    contents.forEach(c => {
      c.classList.remove('tab-show');
      if (c.id === target) {
        c.classList.add('tab-show');
      }
    });
  });
});

// Redirect both forms to index.html
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // stop real submit
    window.location.href = "index.html";
  });
});

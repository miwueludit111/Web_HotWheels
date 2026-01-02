const openVideo = document.getElementById('openVideo');
const modal = document.getElementById('videoModal');
const closeBtn = document.querySelector('.close');

openVideo.addEventListener('click', () => {
  modal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

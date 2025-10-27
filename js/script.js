// Simple beginner-friendly script to fetch APOD-style JSON and render a gallery.

// URL to the JSON feed
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Array of fun space facts
const spaceFacts = [
  "A day on Venus is longer than its year! Venus takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
  "The footprints on the Moon will be there for 100 million years because there's no wind or water to erode them.",
  "One million Earths could fit inside the Sun, and the Sun is considered an average-size star.",
  "If two pieces of the same type of metal touch in space, they will bond and be permanently stuck together.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 6 billion tons on Earth.",
  "The largest known star, UY Scuti, is so big that if placed at the center of our solar system, it would extend beyond Jupiter's orbit.",
  "There are more stars in the universe than grains of sand on all the beaches on Earth.",
  "The International Space Station travels at 17,500 miles per hour, orbiting Earth every 90 minutes.",
  "A year on Neptune lasts 165 Earth years, so if you were born on Neptune, you'd wait a very long time for your first birthday!",
  "The center of the Milky Way smells like raspberries and tastes like rum (due to ethyl formate in space clouds).",
  "Saturn's rings are made of billions of pieces of ice and rock, some as small as grains of sand and others as large as mountains.",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 400 years and is larger than Earth.",
  "Light from the Sun takes 8 minutes and 20 seconds to reach Earth, traveling at 186,282 miles per second.",
  "The coldest place in the universe is the Boomerang Nebula, with temperatures reaching -458°F (-272°C).",
  "Astronauts grow up to 2 inches taller in space because the spine expands without gravity compressing it."
];

// DOM references
const getImageBtn = document.getElementById('getImageBtn');
const gallery = document.getElementById('gallery');
const factText = document.getElementById('factText');

// Create a modal container and append to body
const modal = document.createElement('div');
modal.id = 'itemModal';
modal.className = 'modal hidden';
modal.innerHTML = `
  <div class="modal-backdrop"></div>
  <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <button class="modal-close" aria-label="Close details">✕</button>
    <h2 id="modalTitle"></h2>
    <p class="modal-date"></p>
    <div class="modal-media"></div>
    <p class="modal-explanation"></p>
    <a class="modal-hdlink" target="_blank" rel="noopener">View HD</a>
  </div>
`;
document.body.appendChild(modal);

// Small helper: show loading state
function showLoading() {
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⏳</div><p>Loading...</p></div>`;
}

function showError(message) {
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>${message}</p></div>`;
}

// Render a single gallery card
function renderItem(item) {
  const card = document.createElement('article');
  card.className = 'gallery-item';
  // Provide alt text from title and date
  const altText = `${item.title || 'Space image'} — ${item.date || ''}`;

  // Create media element for images or video thumbnails
  let mediaHTML = '';
  if (item.media_type === 'image') {
    // Use url for display, lazy load images
    mediaHTML = `<img loading="lazy" src="${item.url}" alt="${escapeHtml(altText)}">`;
  } else if (item.media_type === 'video') {
    // Handle video entries: show thumbnail with play button if available
    if (item.thumbnail_url) {
      mediaHTML = `<div class="video-thumb" data-video="${item.url}">
        <img loading="lazy" src="${item.thumbnail_url}" alt="${escapeHtml(altText)}">
        <div class="play-overlay">▶</div>
        <div class="video-badge">VIDEO</div>
      </div>`;
    } else {
      // If no thumbnail, show a clickable video link with icon
      mediaHTML = `<div class="video-link">
        <div class="video-icon">🎬</div>
        <a href="${item.url}" target="_blank" rel="noopener">Watch Video</a>
      </div>`;
    }
  } else {
    mediaHTML = `<div class="unknown-media">No preview</div>`;
  }

  card.innerHTML = `
    ${mediaHTML}
    <p class="card-title">${item.title || 'Untitled'}</p>
    <p class="card-date">${item.date || ''}</p>
  `;

  // Open modal when card or thumbnail clicked
  card.addEventListener('click', (e) => {
    // If a video-thumb was clicked, prefer to open modal with embedded player
    openModal(item);
  });

  return card;
}

// Open modal populated with item details
function openModal(item) {
  modal.querySelector('#modalTitle').textContent = item.title || '';
  modal.querySelector('.modal-date').textContent = item.date || '';
  const mediaContainer = modal.querySelector('.modal-media');
  mediaContainer.innerHTML = '';

  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title || 'Space image';
    img.style.maxWidth = '100%';
    mediaContainer.appendChild(img);
    const hdlink = modal.querySelector('.modal-hdlink');
    if (item.hdurl) {
      hdlink.href = item.hdurl;
      hdlink.style.display = 'inline-block';
    } else {
      hdlink.style.display = 'none';
    }
  } else if (item.media_type === 'video') {
    // Handle video entries in modal: embed or provide link
    if (item.url && (item.url.includes('youtube') || item.url.includes('youtu.be'))) {
      // Embed YouTube video in modal
      const iframe = document.createElement('iframe');
      // Convert YouTube URLs to embed format if needed
      let embedUrl = item.url;
      if (item.url.includes('watch?v=')) {
        embedUrl = item.url.replace('watch?v=', 'embed/');
      } else if (item.url.includes('youtu.be/')) {
        embedUrl = item.url.replace('youtu.be/', 'youtube.com/embed/');
      }
      iframe.src = embedUrl;
      iframe.width = '100%';
      iframe.height = '450';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.maxWidth = '100%';
      iframe.style.borderRadius = '4px';
      mediaContainer.appendChild(iframe);
    } else if (item.url && item.url.includes('vimeo')) {
      // Embed Vimeo video
      const iframe = document.createElement('iframe');
      iframe.src = item.url;
      iframe.width = '100%';
      iframe.height = '450';
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.maxWidth = '100%';
      iframe.style.borderRadius = '4px';
      mediaContainer.appendChild(iframe);
    } else {
      // Fallback: show clickable link for other video types
      const linkContainer = document.createElement('div');
      linkContainer.className = 'video-modal-link';
      linkContainer.innerHTML = `
        <p style="margin-bottom: 1rem; color: #5b616b;">This is a video entry. Click below to watch:</p>
        <a href="${item.url || '#'}" target="_blank" rel="noopener" class="video-button">
          🎬 Open Video in New Tab
        </a>
      `;
      mediaContainer.appendChild(linkContainer);
    }
    // Hide HD link for videos
    modal.querySelector('.modal-hdlink').style.display = 'none';
  } else {
    mediaContainer.textContent = 'No preview available';
    modal.querySelector('.modal-hdlink').style.display = 'none';
  }

  modal.querySelector('.modal-explanation').textContent = item.explanation || '';
  modal.classList.remove('hidden');

  // focus management
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.focus();
}

// Close modal helpers
modal.addEventListener('click', (e) => {
  // close when clicking backdrop or close button
  if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
    modal.classList.add('hidden');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') modal.classList.add('hidden');
});

// Escape HTML to avoid broken titles (simple)
function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Fetch and render items from the JSON file
async function fetchAndRender() {
  showLoading();
  try {
    const res = await fetch(apodData);
    if (!res.ok) throw new Error(`Network error: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      showError('No items found in the feed.');
      return;
    }
    // Optionally limit the number of items shown initially
    const itemsToShow = data.slice(0, 40);
    gallery.innerHTML = '';
    itemsToShow.forEach(item => gallery.appendChild(renderItem(item)));
  } catch (err) {
    console.error(err);
    showError('Failed to load data. Check your network and try again.');
  }
}

// Function to display a random space fact
function displayRandomFact() {
  // Pick a random index from the spaceFacts array
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  // Get the fact at that index
  const randomFact = spaceFacts[randomIndex];
  // Display it in the fact section
  factText.textContent = randomFact;
}

// Hook button to fetch and display images from JSON file
getImageBtn.addEventListener('click', fetchAndRender);

// Display a random space fact when the page loads
displayRandomFact();

// Optional: automatic fetch on load
// fetchAndRender();
const featuredVideoEl = document.getElementById("featured-video");
const featuredTitleEl = document.getElementById("featured-title");
const featuredDescriptionEl = document.getElementById("featured-description");
const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");
const videoSectionsEl = document.getElementById("video-sections");
const heroSection = document.querySelector(".hero");

let isFullscreen = false;
let videoData = null;  // Will hold fetched data

// Fetch video data from your backend API
async function fetchVideoData() {
  try {
const email = localStorage.getItem("userEmail"); 

const response = await fetch(`https://no-licence-user-db-manager-runner-83470708869.us-central1.run.app/api/videos?email=${encodeURIComponent(email)}`, { method: 'GET' });

    if (!response.ok) throw new Error('Failed to load video data');
    videoData = await response.json();
    init(); 
  } catch (err) {
    console.error('Error fetching video data:', err);
  }
}

// Initialize featured video and text
function loadFeaturedVideo() {
  const f = videoData.featured;
  featuredTitleEl.textContent = f.title;
  featuredDescriptionEl.textContent = f.description;
  featuredVideoEl.src = f.videoUrl;
  featuredVideoEl.poster = f.poster;
  featuredVideoEl.load();
}

// The rest of your code remains the same...
// (you do not need to change buildVideoRow, loadVideoToFeatured, etc.)

// Initialize website content
function init() {
  loadFeaturedVideo();
  videoData.categories.forEach((cat) => {
    const row = buildVideoRow(cat);
    videoSectionsEl.appendChild(row);
  });
}

fetchVideoData();

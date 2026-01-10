
// Flatten for navigation
if (typeof courseData !== 'undefined') {
    courseData.lessons = courseData.modules.flatMap(m => m.lessons);
}

let currentLessonIndex = 0;
let playbackSpeed = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (typeof courseData === 'undefined') {
        console.error('courseData is not defined');
        return;
    }
    loadProgress();
    renderLessons();
    updateProgress();
    updateStreak();
    loadNotes();
    setupEventListeners();
});

// Load from localStorage
function loadProgress() {
    const saved = localStorage.getItem(`course_${courseData.id}`);
    if (saved) {
        const data = JSON.parse(saved);
        courseData.lessons.forEach((lesson, i) => {
            lesson.completed = data.completed[i] || false;
        });
        currentLessonIndex = data.currentLesson || 0;
    }
}

// Save to localStorage
function saveProgress() {
    const data = {
        completed: courseData.lessons.map(l => l.completed),
        currentLesson: currentLessonIndex
    };
    localStorage.setItem(`course_${courseData.id}`, JSON.stringify(data));
}

// Render lessons list
function renderLessons() {
    const container = document.getElementById('lessonsContainer');
    let overallLessonIndex = 0;

    container.innerHTML = courseData.modules.map((module, mIdx) => {
        const completedInModule = module.lessons.filter(l => l.completed).length;
        const totalInModule = module.lessons.length;

        // Check if module should be open (if it contains current lesson or is the first one)
        const startIdx = overallLessonIndex;
        const endIdx = startIdx + totalInModule - 1;
        const isOpen = (currentLessonIndex >= startIdx && currentLessonIndex <= endIdx) || mIdx === 0;

        const moduleHtml = `
                <div class="section-block ${isOpen ? 'open' : ''}">
                    <div class="section-header" onclick="this.parentElement.classList.toggle('open')">
                        <div>
                            <h5>${module.title}</h5>
                            <div class="section-meta">${completedInModule}/${totalInModule} مكتمل</div>
                        </div>
                        <i class="bi bi-chevron-down chevron"></i>
                    </div>
                    <div class="lesson-list">
                        ${module.lessons.map((lesson) => {
            const absIdx = overallLessonIndex;
            const html = `
                            <div class="lesson-item ${lesson.completed ? 'completed' : ''} ${absIdx === currentLessonIndex ? 'active' : ''}"
                                 onclick="selectLesson(${absIdx})">
                                <div class="lesson-num">
                                    ${lesson.completed ? '<i class="bi bi-check"></i>' : absIdx + 1}
                                </div>
                                <div class="lesson-details">
                                    <h6>${lesson.title}</h6>
                                    <span><i class="bi bi-play-circle"></i> فيديو</span>
                                </div>
                                <span class="lesson-duration">${lesson.duration}</span>
                            </div>
                            `;
            overallLessonIndex++;
            return html;
        }).join('')}
                    </div>
                </div>
                `;
        return moduleHtml;
    }).join('');
}

// Select lesson
function selectLesson(index) {
    currentLessonIndex = index;
    const lesson = courseData.lessons[index];

    document.getElementById('currentTitle').textContent = lesson.title;
    document.getElementById('currentNum').textContent = index + 1;
    document.getElementById('videoPlayer').src = `https://www.youtube.com/embed/${lesson.videoId}?enablejsapi=1`;

    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').disabled = index === courseData.lessons.length - 1;

    document.getElementById('completeBtn').classList.toggle('completed', lesson.completed);

    renderLessons();
    saveProgress();
    closeSidebar();
}

// Update progress display
function updateProgress() {
    const completed = courseData.lessons.filter(l => l.completed).length;
    const total = courseData.lessons.length;
    const pct = Math.round((completed / total) * 100);

    document.getElementById('progressValue').textContent = pct + '%';
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('totalNum').textContent = total;

    // Update circle
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (pct / 100) * circumference;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;

    // Estimate remaining time
    const remaining = courseData.lessons.filter(l => !l.completed);
    let mins = 0;
    remaining.forEach(l => {
        const parts = l.duration.split(':');
        mins += parseInt(parts[0]);
    });
    document.getElementById('timeRemaining').textContent = `متبقي ~${mins} دقيقة`;
}

// Toggle lesson completion
function toggleComplete() {
    const lesson = courseData.lessons[currentLessonIndex];
    lesson.completed = !lesson.completed;

    document.getElementById('completeBtn').classList.toggle('completed', lesson.completed);

    renderLessons();
    updateProgress();
    saveProgress();

    if (lesson.completed) {
        showToast();
        triggerConfetti();
        updateStreak();
    }
}

// Toast notification
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Confetti effect
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00a19e', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            life: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        particles.forEach(p => {
            if (p.life > 0) {
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5;
                p.life -= 0.02;

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        });

        if (alive) requestAnimationFrame(animate);
    }

    animate();
}

// Streak management
function updateStreak() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    let streak = parseInt(localStorage.getItem('streak') || '0');

    if (lastVisit !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        streak = (lastVisit === yesterday) ? streak + 1 : 1;
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastVisit', today);
    }

    document.getElementById('streakCount').textContent = streak;
}

// Notes
function loadNotes() {
    const notes = localStorage.getItem(`notes_${courseData.id}_${currentLessonIndex}`);
    if (notes) document.getElementById('notesArea').value = notes;
}

function saveNotes() {
    const notes = document.getElementById('notesArea').value;
    localStorage.setItem(`notes_${courseData.id}_${currentLessonIndex}`, notes);
    showToast();
}

// Sidebar toggle
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('prevBtn').onclick = () => {
        if (currentLessonIndex > 0) selectLesson(currentLessonIndex - 1);
    };
    document.getElementById('nextBtn').onclick = () => {
        if (currentLessonIndex < courseData.lessons.length - 1) selectLesson(currentLessonIndex + 1);
    };

    // Complete button
    document.getElementById('completeBtn').onclick = toggleComplete;

    // Mobile toggle
    document.getElementById('mobileToggle').onclick = () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('overlay').classList.add('show');
    };
    document.getElementById('overlay').onclick = closeSidebar;

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        };
    });

    // Speed options
    document.querySelectorAll('.speed-option').forEach(opt => {
        opt.onclick = () => {
            playbackSpeed = parseFloat(opt.dataset.speed);
            document.querySelectorAll('.speed-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            document.getElementById('speedBtn').innerHTML = `<span style="font-size: 0.75rem; font-weight: 700;">${playbackSpeed}x</span>`;
        };
    });

    // Bookmark
    document.getElementById('bookmarkBtn').onclick = function () {
        this.classList.toggle('active');
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

        switch (e.key) {
            case 'ArrowRight':
                if (currentLessonIndex > 0) selectLesson(currentLessonIndex - 1);
                break;
            case 'ArrowLeft':
                if (currentLessonIndex < courseData.lessons.length - 1) selectLesson(currentLessonIndex + 1);
                break;
            case 'c':
                toggleComplete();
                break;
        }
    });

    // Search
    document.getElementById('searchInput').oninput = function () {
        const query = this.value.toLowerCase();
        document.querySelectorAll('.lesson-item').forEach(item => {
            const title = item.querySelector('h6').textContent.toLowerCase();
            item.style.display = title.includes(query) ? 'flex' : 'none';
        });
    };
}

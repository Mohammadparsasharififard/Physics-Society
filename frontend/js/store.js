/**
 * Global App Store, Sound Effects & Utilities
 */
class AppStore {
    constructor() {
        this.currentUser = null;
        this.currentView = 'landing'; // 'landing', 'dashboard', 'curriculum', 'lesson', 'exam', 'competition', 'leaderboard', 'badges', 'admin'
        this.viewParams = {};
        this.grades = [];
        this.selectedGrade = null;
        this.theme = localStorage.getItem('theme') || 'dark';
        this.initTheme();
    }

    initTheme() {
        if (this.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.initTheme();
        if (window.updateNavbar) {
            window.updateNavbar();
        }
    }

    setUser(user) {
        this.currentUser = user;
        window.dispatchEvent(new CustomEvent('user-changed', { detail: user }));
    }

    setView(view, params = {}) {
        this.currentView = view;
        this.viewParams = params;
        window.location.hash = view + (params.id ? `/${params.id}` : '');
        window.dispatchEvent(new CustomEvent('view-changed', { detail: { view, params } }));
    }

    // Web Audio API Synthesized Sound Effects (zero external mp3 file dependencies!)
    playSound(type) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'correct') {
                // Happy high chime
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
            } else if (type === 'wrong') {
                // Low thud
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.35);
            } else if (type === 'celebrate') {
                // Level up fanfare
                [0, 0.1, 0.2, 0.35].forEach((t, i) => {
                    const freqs = [440, 554.37, 659.25, 880];
                    const noteOsc = ctx.createOscillator();
                    const noteGain = ctx.createGain();
                    noteOsc.connect(noteGain);
                    noteGain.connect(ctx.destination);
                    noteOsc.frequency.setValueAtTime(freqs[i], ctx.currentTime + t);
                    noteGain.gain.setValueAtTime(0.25, ctx.currentTime + t);
                    noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + t + 0.25);
                    noteOsc.start(ctx.currentTime + t);
                    noteOsc.stop(ctx.currentTime + t + 0.25);
                });
            }
        } catch (e) {
            console.warn('Audio playback unavailable:', e);
        }
    }
}

window.store = new AppStore();

// Persian Date Helper
window.formatPersianDate = function(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(d);
    } catch (e) {
        return dateStr;
    }
};

window.formatPersianTime = function(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(d);
    } catch (e) {
        return dateStr;
    }
};

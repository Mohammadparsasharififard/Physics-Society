/**
 * Main Single Page Application Router & State Orchestrator
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check for stored token and fetch current user
    if (window.api.token) {
        try {
            const user = await window.api.getCurrentUser();
            window.store.setUser(user);
        } catch (e) {
            console.warn('Session expired or invalid:', e);
            window.api.setToken(null);
            window.store.setUser(null);
        }
    }

    // 2. Setup hash routing listener
    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('view-changed', () => renderCurrentView());
    window.addEventListener('user-changed', () => {
        updateNavbar();
        renderCurrentView();
    });
    window.addEventListener('auth-expired', () => {
        const hadUser = !!window.store.currentUser;
        window.store.setUser(null);
        if (hadUser) {
            window.store.setView('landing');
        }
    });

    // 3. Initial Route
    handleRouting();
});

function updateNavbar() {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && window.renderNavbar) {
        navContainer.innerHTML = window.renderNavbar();
        if (window.lucide) window.lucide.createIcons();
    }
}
window.updateNavbar = updateNavbar;

function handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'landing';
    const parts = hash.split('/');
    const viewName = parts[0];
    const viewId = parts[1] || null;

    window.store.currentView = viewName;
    window.store.viewParams = { id: viewId };
    updateNavbar();
    renderCurrentView();
}

async function renderCurrentView() {
    const mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) return;

    const view = window.store.currentView;
    const params = window.store.viewParams;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'landing') {
        await renderLandingView(mainContainer);
    } else if (view === 'dashboard') {
        if (!window.store.currentUser) {
            openAuthModal('login');
            return;
        }
        await renderDashboardView(mainContainer);
    } else if (view === 'curriculum') {
        await renderCurriculumView(mainContainer, params.id);
    } else if (view === 'chapter') {
        await renderChapterDetailView(mainContainer, params.id);
    } else if (view === 'lesson') {
        await loadAndStartLesson(mainContainer, params.id);
    } else if (view === 'exam') {
        await loadAndStartExam(mainContainer, params.id);
    } else if (view === 'competitions') {
        if (window.renderCompetitionsView) {
            await window.renderCompetitionsView('app-main-content');
        }
    } else if (view === 'leaderboards') {
        if (window.renderLeaderboardsView) {
            await window.renderLeaderboardsView('app-main-content');
        }
    } else if (view === 'badges') {
        if (window.renderBadgesView) {
            await window.renderBadgesView('app-main-content');
        }
    } else if (view === 'admin') {
        if (!window.store.currentUser || window.store.currentUser.role !== 'admin') {
            alert('دسترسی غیرمجاز. فقط مدیر سامانه مجاز به ورود است.');
            window.store.setView('landing');
            return;
        }
        window.currentAdminViews = new window.AdminViews('app-main-content');
        window.currentAdminViews.render();
    } else {
        await renderLandingView(mainContainer);
    }

    if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// VIEW: LANDING PAGE
// ==========================================
async function renderLandingView(container) {
    let stats = { students_count: 0, questions_count: 360, exams_count: 12, competitions_count: 1 };
    try {
        stats = await window.api.getPublicStats();
    } catch (e) {}

    container.innerHTML = `
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-16 sm:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="space-y-6 text-right">
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold">
                        <i data-lucide="zap" class="w-4 h-4 text-blue-600 fill-blue-600"></i>
                        <span>سامانه یادگیری هوشمند فیزیک دبیرستان استعدادهای درخشان شهید بهشتی ۲</span>
                    </div>

                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        یادگیری عمیق فیزیک، <br/>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">لذت‌بخش و تعاملی</span>
                    </h1>

                    <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                        پلتفرم رسمی آموزش فیزیک پایه‌های هفتم، هشتم و نهم بر پایه کتاب‌های رسمی وزارت آموزش و پرورش و کتب تکمیلی سمپاد. همراه با آزمون‌های تصحیح هوشمند، مسابقات هفتگی و گیمیفیکیشن.
                    </p>

                    <div class="flex flex-wrap items-center gap-4 pt-4">
                        <button onclick="window.store.setView('curriculum')" class="btn-duo-green text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg flex items-center gap-2">
                            <span>شروع یادگیری فیزیک</span>
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        </button>
                        <button onclick="window.store.setView('competitions')" class="btn-duo-yellow text-slate-900 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-2">
                            <i data-lucide="trophy" class="w-4 h-4 text-amber-700"></i>
                            <span>مسابقه هفتگی</span>
                        </button>
                    </div>

                    <!-- Mini Highlights -->
                    <div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                        <div class="flex items-center gap-2">
                            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
                            <span>۳۶۰+ سؤال تستی و تشریحی</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="cpu" class="w-4 h-4 text-blue-500"></i>
                            <span>تصحیح هوشمند AI</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="award" class="w-4 h-4 text-amber-500"></i>
                            <span>مدال‌ها و استمرار</span>
                        </div>
                    </div>
                </div>

                <!-- Hero Graphic / Illustration -->
                <div class="relative">
                    <div class="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-emerald-600/10 p-8 border border-slate-200 dark:border-slate-800 relative flex flex-col justify-center items-center text-center space-y-6">
                        <div class="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse">
                            <i data-lucide="atom" class="w-14 h-14"></i>
                        </div>
                        <div class="space-y-2">
                            <h3 class="text-xl font-bold text-slate-800 dark:text-white">آزمایشگاه مجازی فیزیک سمپاد</h3>
                            <p class="text-xs text-slate-500 max-w-xs">نیرو، کار، انرژی، مغناطیس، الکتریسیته، نور، فشار و ماشین‌ها در محیطی مدرن</p>
                        </div>
                        <!-- Mini Card badges -->
                        <div class="flex items-center gap-3">
                            <span class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm">پایه هفتم</span>
                            <span class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm">پایه هشتم</span>
                            <span class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm">پایه نهم</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 3 Grades Selection Grid -->
    <section class="py-12 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div class="text-center space-y-2">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">پایه‌های تحصیلی و سرفصل‌های آموزشی</h2>
                <p class="text-xs text-slate-500">پایه مورد نظر خود را جهت مشاهده کتاب‌های درسی و دروس تعاملی انتخاب کنید</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Grade 7 -->
                <div onclick="window.store.currentUser && window.store.currentUser.role === 'student' ? window.store.setView('curriculum', { id: window.store.currentUser.grade_id }) : window.store.setView('curriculum', { id: 1 })" class="physics-card-3d bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer space-y-4 relative overflow-hidden">
                    ${window.store.currentUser && window.store.currentUser.grade_id === 1 ? '<span class="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-400/30">پایه شما</span>' : ''}
                    <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-500 flex items-center justify-center font-black text-xl">
                        ۷
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-800 dark:text-white">پایه هفتم</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">اندازه‌گیری و ابزارها • انرژی و تبدیل‌های آن • منابع انرژی • گرما و بهینه‌سازی مصرف</p>
                    </div>
                    <div class="flex items-center justify-between text-xs font-bold text-blue-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>۲ کتاب • ۴ فصل جامع فیزیک</span>
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    </div>
                </div>

                <!-- Grade 8 -->
                <div onclick="window.store.currentUser && window.store.currentUser.role === 'student' ? window.store.setView('curriculum', { id: window.store.currentUser.grade_id }) : window.store.setView('curriculum', { id: 2 })" class="physics-card-3d bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer space-y-4 relative overflow-hidden">
                    ${window.store.currentUser && window.store.currentUser.grade_id === 2 ? '<span class="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-400/30">پایه شما</span>' : ''}
                    <div class="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-400 flex items-center justify-center font-black text-xl">
                        ۸
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-800 dark:text-white">پایه هشتم</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">الکتریسیته ساکن و جاری • مغناطیس و قطب‌ها • نور و بازتاب • شکست نور و عدسی‌ها</p>
                    </div>
                    <div class="flex items-center justify-between text-xs font-bold text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>۲ کتاب • ۴ فصل جامع فیزیک</span>
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    </div>
                </div>

                <!-- Grade 9 -->
                <div onclick="window.store.currentUser && window.store.currentUser.role === 'student' ? window.store.setView('curriculum', { id: window.store.currentUser.grade_id }) : window.store.setView('curriculum', { id: 3 })" class="physics-card-3d bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer space-y-4 relative overflow-hidden">
                    ${window.store.currentUser && window.store.currentUser.grade_id === 3 ? '<span class="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold border border-purple-400/30">پایه شما</span>' : ''}
                    <div class="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-400 flex items-center justify-center font-black text-xl">
                        ۹
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-800 dark:text-white">پایه نهم</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">حرکت، تندی و شتاب • نیرو و قوانین نیوتون • فشار جامدات و شاره‌ها • ماشین‌ها و اهرم‌ها</p>
                    </div>
                    <div class="flex items-center justify-between text-xs font-bold text-purple-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>۲ کتاب • ۴ فصل جامع فیزیک</span>
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
}

// ==========================================
// VIEW: STUDENT DASHBOARD
// ==========================================
async function renderDashboardView(container) {
    container.innerHTML = `<div class="text-center py-12"><div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>`;
    try {
        const data = await window.api.getDashboard();
        const s = data.student;

        container.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <!-- Greeting & Stats Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-xs text-blue-200 font-bold block mb-1">خوش آمدید،</span>
                        <h1 class="text-2xl sm:text-3xl font-extrabold">${s.full_name}</h1>
                        <span class="text-xs text-blue-100 mt-1 inline-block">${s.grade_title_fa} • رتبه ${s.rank} مدرسه</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                            <span class="text-[11px] text-blue-200 block">سطح شما</span>
                            <span class="text-lg font-black font-sans">سطح ${s.current_level}</span>
                        </div>
                        <div class="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                            <span class="text-[11px] text-blue-200 block">مجموع امتیاز</span>
                            <span class="text-lg font-black font-sans">${s.total_xp} XP</span>
                        </div>
                    </div>
                </div>

                <!-- Daily Streak Banner -->
                <div class="flex items-center justify-between p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-xs">
                    <div class="flex items-center gap-3">
                        <i data-lucide="flame" class="w-6 h-6 text-orange-400 streak-flame-active fill-orange-400"></i>
                        <div>
                            <span class="font-bold block text-sm">${s.current_streak} روز استمرار یادگیری!</span>
                            <span class="text-blue-200 text-[11px]">با ورود و تمرین روزانه نشان‌های ویژه کسب کنید.</span>
                        </div>
                    </div>
                    <button onclick="window.store.setView('curriculum')" class="btn-duo-green text-white font-bold px-4 py-2 rounded-xl text-xs">
                        ادامه درس‌ها
                    </button>
                </div>
            </div>

            <!-- Active Competition Widget -->
            ${data.active_competition ? `
            <div class="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
                        <i data-lucide="trophy" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-amber-700 dark:text-amber-300 block">مسابقه فعال هفته</span>
                        <h3 class="font-bold text-base text-slate-800 dark:text-white">${data.active_competition.title_fa}</h3>
                    </div>
                </div>
                <button onclick="window.store.setView('competitions')" class="btn-duo-yellow text-slate-900 font-bold px-6 py-2.5 rounded-xl text-xs">
                    ورود به مسابقه
                </button>
            </div>
            ` : ''}

            <!-- Recent Exams and Notifications Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Exam Attempts -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-base text-slate-800 dark:text-white">نتایج آزمون‌های اخیر شما</h3>
                    </div>

                    <div class="divide-y divide-slate-100 dark:divide-slate-800">
                        ${data.recent_exams.length === 0 ? '<p class="text-xs text-slate-400 py-4">هنوز در آزمونی شرکت نکرده‌اید.</p>' : data.recent_exams.map(e => `
                        <div class="py-3 flex items-center justify-between text-xs">
                            <div>
                                <span class="font-bold text-slate-800 dark:text-white block">${e.title_fa}</span>
                                <span class="text-[11px] text-slate-400">${window.formatPersianDate(e.date)}</span>
                            </div>
                            <div class="text-left font-sans">
                                <span class="font-bold ${e.is_passed ? 'text-emerald-500' : 'text-rose-500'} text-sm">${e.score} / ${e.total_points}</span>
                                <span class="text-[10px] text-slate-400 block">${e.percentage}٪</span>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Notifications -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 class="font-bold text-base text-slate-800 dark:text-white">پیام‌ها و اعلان‌های آموزشی</h3>
                    <div class="divide-y divide-slate-100 dark:divide-slate-800">
                        ${data.notifications.length === 0 ? '<p class="text-xs text-slate-400 py-4">پیام جدیدی وجود ندارد.</p>' : data.notifications.map(n => `
                        <div class="py-3 space-y-1 text-xs">
                            <span class="font-bold text-slate-800 dark:text-white block">${n.title_fa}</span>
                            <p class="text-slate-600 dark:text-slate-300 text-[11px]">${n.message_fa}</p>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    } catch (e) {
        container.innerHTML = `<div class="p-6 text-center text-rose-500">${e.message}</div>`;
    }
}

// ==========================================
// VIEW: CURRICULUM BROWSER
// ==========================================
async function renderCurriculumView(container, gradeId = null) {
    container.innerHTML = `<div class="text-center py-12"><div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>`;
    try {
        const grades = await window.api.getGrades();
        const user = window.store.currentUser;

        // Strict Grade Scoping: If user is a student, lock strictly to their registered grade
        let activeGradeId;
        let isGradeLocked = false;
        if (user && user.role === 'student' && user.grade_id) {
            activeGradeId = user.grade_id;
            isGradeLocked = true;
        } else {
            activeGradeId = gradeId || (grades[0] ? grades[0].id : 1);
        }

        const books = await window.api.getBooks(activeGradeId);
        const currentGradeObj = grades.find(g => g.id == activeGradeId) || { title_fa: 'پایه تحصیلی' };

        let booksHtml = '';
        for (let b of books) {
            const chapters = await window.api.getChapters(b.id);
            booksHtml += `
            <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl flex items-center justify-center ${b.book_type === 'sampad' ? 'bg-purple-900/40 text-purple-400 border border-purple-500/30' : 'bg-blue-900/40 text-blue-400 border border-blue-500/30'}">
                            <i data-lucide="book" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-extrabold text-lg text-slate-800 dark:text-white">${b.title_fa}</h3>
                            <span class="text-xs text-slate-400">${b.publisher_fa || 'آموزش و پرورش'} • سال تحصیلی ${b.academic_year || '۱۴۰۴-۱۴۰۵'}</span>
                        </div>
                    </div>
                    <span class="text-xs px-3 py-1 rounded-full font-bold ${b.book_type === 'sampad' ? 'bg-purple-950/60 text-purple-300 border border-purple-700/50' : 'bg-blue-950/60 text-blue-300 border border-blue-700/50'}">
                        ${b.book_type === 'sampad' ? 'تکمیلی سمپاد (شهید بهشتی ۲)' : 'کتاب رسمی آموزش و پرورش'}
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    ${chapters.map(ch => `
                    <div onclick="window.store.setView('chapter', { id: ${ch.id} })" class="physics-card-3d bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer space-y-3.5">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black px-3 py-1 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-400/20">
                                فصل ${ch.chapter_number}
                            </span>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                                <i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-400"></i>
                                <span>${ch.source_pages || ''}</span>
                            </span>
                        </div>

                        <h4 class="font-black text-lg text-slate-800 dark:text-white leading-snug">${ch.title_fa}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">${ch.description_fa || ''}</p>

                        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                            <span class="text-slate-400 flex items-center gap-1.5">
                                <i data-lucide="play-circle" class="w-4 h-4 text-emerald-500"></i>
                                <span>${ch.lesson_count} درس تعاملی</span>
                            </span>
                            <span class="text-slate-400 flex items-center gap-1.5 font-sans">
                                <i data-lucide="help-circle" class="w-4 h-4 text-indigo-400"></i>
                                <span>${ch.mcq_count} تست • ${ch.written_count} تشریحی</span>
                            </span>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            `;
        }

        container.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <!-- Header section based on grade locking -->
            ${isGradeLocked ? `
            <div class="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-500/30 backdrop-blur-md shadow-lg">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/30">
                            ${activeGradeId == 1 ? '۷' : (activeGradeId == 2 ? '۸' : '۹')}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                                    پایه تحصیلی اختصاصی شما
                                </span>
                                <span class="text-xs text-slate-400">• ۲ منبع آموزشی کامل</span>
                            </div>
                            <h2 class="text-xl sm:text-2xl font-black text-white mt-1">
                                برنامه درسی ${currentGradeObj.title_fa}
                            </h2>
                            <p class="text-xs text-slate-300 mt-0.5">مطابق سرفصل‌های کتاب رسمی آموزش و پرورش و کتاب علوم تکمیلی سمپاد شهید بهشتی ۲</p>
                        </div>
                    </div>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold self-start sm:self-center">
                        <i data-lucide="shield-check" class="w-4 h-4"></i>
                        <span>ثبت‌نام رسمی در این پایه</span>
                    </span>
                </div>
            </div>
            ` : `
            <!-- Grade Switcher Tabs (For Admin or Guest) -->
            <div class="flex flex-col items-center justify-center gap-4 text-center">
                <div class="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
                    ${grades.map(g => `
                    <button onclick="window.store.setView('curriculum', { id: ${g.id} })" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${g.id == activeGradeId ? 'btn-duo-blue text-white shadow-md' : 'text-slate-300 hover:text-white'}">
                        ${g.title_fa}
                    </button>
                    `).join('')}
                </div>
                ${!user ? `
                <p class="text-xs text-slate-400">
                    دانش‌آموز عزیز؛ برای ذخیره پیشرفت درسی و شرکت در آزمون‌ها، لطفاً <button onclick="window.openAuthModal('login')" class="text-blue-400 font-bold hover:underline">وارد شوید</button> یا <button onclick="window.openAuthModal('register')" class="text-blue-400 font-bold hover:underline">ثبت‌نام کنید</button>.
                </p>
                ` : ''}
            </div>
            `}

            <!-- Books & Chapters -->
            <div class="space-y-12">
                ${booksHtml}
            </div>
        </div>
        `;
    } catch (e) {
        container.innerHTML = `<div class="p-6 text-center text-rose-500">${e.message}</div>`;
    }
}

// ==========================================
// VIEW: CHAPTER DETAIL & LESSON LIST
// ==========================================
async function renderChapterDetailView(container, chapterId) {
    container.innerHTML = `<div class="text-center py-12"><div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>`;
    try {
        const ch = await window.api.getChapter(chapterId);

        container.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <!-- Chapter Hero -->
            <div class="physics-card-3d bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between text-xs text-slate-500">
                    <span class="font-bold text-blue-500">پایه ${ch.grade_number} • ${ch.book_title_fa}</span>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-400"></i>
                        <span>${ch.source_pages || ''}</span>
                    </span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">فصل ${ch.chapter_number}: ${ch.title_fa}</h1>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${ch.description_fa || ''}</p>

                ${ch.objectives_fa ? `
                <div class="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                    <span class="font-bold text-blue-800 dark:text-blue-300 block mb-1">اهداف یادگیری فصل:</span>
                    <div class="whitespace-pre-line leading-relaxed">${ch.objectives_fa}</div>
                </div>
                ` : ''}
            </div>

            <!-- Lessons Progression Path -->
            <div class="space-y-4">
                <h3 class="font-bold text-lg text-slate-800 dark:text-white">دروس تعاملی فصل (مسیر یادگیری):</h3>
                <div class="space-y-3">
                    ${ch.lessons.map(l => {
                        const simType = window.physicsSimulators ? window.physicsSimulators.getSimulatorForLesson(l) : null;
                        return `
                    <div class="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${l.is_completed ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/40' : 'bg-blue-950/50 text-blue-400 border border-blue-500/40'}">
                                <i data-lucide="${l.is_completed ? 'check' : 'play'}" class="w-5 h-5"></i>
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <h4 class="font-bold text-sm text-slate-800 dark:text-white">${l.title_fa}</h4>
                                    ${simType ? `
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                                        <i data-lucide="atom" class="w-3 h-3 text-cyan-400"></i>
                                        <span>آزمایشگاه مجازی</span>
                                    </span>
                                    ` : ''}
                                </div>
                                <span class="text-xs text-slate-400 font-sans block">مدت: ${l.estimated_minutes} دقیقه • پاداش: +${l.xp_reward} XP</span>
                            </div>
                        </div>

                        <button onclick="window.store.setView('lesson', { id: ${l.id} })" class="${l.is_completed ? 'btn-duo-blue' : 'btn-duo-green'} text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm whitespace-nowrap">
                            ${l.is_completed ? 'مرور مجدد' : 'شروع درس'}
                        </button>
                    </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Chapter Examination Card -->
            ${ch.exam_id ? `
            <div class="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-2 border-indigo-200 dark:border-indigo-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">ارزیابی پایان فصل</span>
                    <h3 class="font-bold text-lg text-slate-900 dark:text-white">${ch.exam_title_fa}</h3>
                    <p class="text-xs text-slate-500 mt-1">آزمون جامع شامل سؤالات تستی و تشریحی با تصحیح هوشمند هوش مصنوعی</p>
                </div>
                <button onclick="window.store.setView('exam', { id: ${ch.exam_id} })" class="btn-duo-green text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md whitespace-nowrap">
                    شرکت در آزمون فصل
                </button>
            </div>
            ` : ''}
        </div>
        `;
    } catch (e) {
        container.innerHTML = `<div class="p-6 text-center text-rose-500">${e.message}</div>`;
    }
}

// ==========================================
// VIEW: INTERACTIVE LESSON RUNNER
// ==========================================
async function loadAndStartLesson(container, lessonId) {
    container.innerHTML = `<div class="text-center py-16"><div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>`;
    try {
        const lesson = await window.api.getLesson(lessonId);
        window.currentDuolingoPlayer = new window.DuolingoPlayer(lesson, 'app-main-content');
        window.currentDuolingoPlayer.render();
    } catch (e) {
        container.innerHTML = `<div class="p-6 text-center text-rose-500">${e.message}</div>`;
    }
}

// ==========================================
// VIEW: EXAMINATION RUNNER
// ==========================================
async function loadAndStartExam(container, examId) {
    if (!window.store.currentUser) {
        openAuthModal('login');
        return;
    }

    container.innerHTML = `<div class="text-center py-16"><div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>`;
    try {
        const examStartData = await window.api.startExam(examId);
        window.currentExamRunner = new window.ExamRunner(examStartData, 'app-main-content');
        window.currentExamRunner.render();
    } catch (e) {
        container.innerHTML = `<div class="p-6 text-center text-rose-500">${e.message}</div>`;
    }
}

// ==========================================
// AUTH MODAL & LOGOUT
// ==========================================
function openAuthModal(mode = 'login') {
    const existing = document.getElementById('auth-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'auth-modal-backdrop';
    backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';

    backdrop.innerHTML = `
    <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white" id="auth-modal-title">
                ${mode === 'login' ? 'ورود به حساب کاربری' : 'ثبت‌نام دانش‌آموز'}
            </h3>
            <button onclick="document.getElementById('auth-modal-backdrop').remove()" class="p-2 text-slate-400 hover:text-slate-600">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <form id="auth-form" onsubmit="handleAuthSubmit(event, '${mode}')" class="space-y-4 text-xs font-semibold">
            ${mode === 'register' ? `
            <div>
                <label class="block text-slate-600 dark:text-slate-300 mb-1">نام و نام خانوادگی:</label>
                <input type="text" id="auth-fullname" required placeholder="مثال: امیررضا علوی"
                    class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none" />
            </div>
            <div>
                <label class="block text-slate-600 dark:text-slate-300 mb-1">پایه تحصیلی:</label>
                <select id="auth-grade" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                    <option value="1">پایه هفتم</option>
                    <option value="2">پایه هشتم</option>
                    <option value="3">پایه نهم</option>
                </select>
            </div>
            ` : ''}

            <div>
                <label class="block text-slate-600 dark:text-slate-300 mb-1">نام کاربری:</label>
                <input type="text" id="auth-username" required placeholder="username"
                    class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono outline-none" />
            </div>

            <div>
                <label class="block text-slate-600 dark:text-slate-300 mb-1">رمز عبور:</label>
                <input type="password" id="auth-password" required placeholder="••••••••"
                    class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono outline-none" />
            </div>

            <div class="pt-2">
                <button type="submit" class="btn-duo-green w-full text-white font-bold py-3 rounded-2xl shadow-md text-sm">
                    ${mode === 'login' ? 'ورود به سامانه' : 'تکمیل ثبت‌نام'}
                </button>
            </div>
        </form>

        <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            ${mode === 'login' ? `
            <span class="text-slate-400">حساب کاربری ندارید؟</span>
            <button onclick="openAuthModal('register')" class="text-blue-600 font-bold hover:underline mr-1">ثبت‌نام کنید</button>
            ` : `
            <span class="text-slate-400">قبلاً ثبت‌نام کرده‌اید؟</span>
            <button onclick="openAuthModal('login')" class="text-blue-600 font-bold hover:underline mr-1">وارد شوید</button>
            `}
        </div>
    </div>
    `;

    document.body.appendChild(backdrop);
    if (window.lucide) window.lucide.createIcons();
}

async function handleAuthSubmit(e, mode) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;

    try {
        let res;
        if (mode === 'login') {
            res = await window.api.login(username, password);
        } else {
            const fullName = document.getElementById('auth-fullname').value.trim();
            const gradeId = parseInt(document.getElementById('auth-grade').value);
            res = await window.api.register({
                username: username,
                password: password,
                full_name: fullName,
                grade_id: gradeId
            });
        }

        window.api.setToken(res.access_token);
        window.store.setUser(res.user);

        const modal = document.getElementById('auth-modal-backdrop');
        if (modal) modal.remove();

        window.store.setView('dashboard');
    } catch (err) {
        alert(err.message);
    }
}

function logout() {
    window.api.setToken(null);
    window.store.setUser(null);
    window.store.setView('landing');
}

window.openAuthModal = openAuthModal;
window.handleAuthSubmit = handleAuthSubmit;
window.logout = logout;

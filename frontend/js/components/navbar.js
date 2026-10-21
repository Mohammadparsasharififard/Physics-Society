/**
 * Responsive RTL Navbar Component with Student Stats (Streak, XP, Level)
 */
function renderNavbar() {
    const user = window.store.currentUser;
    const isDark = window.store.theme === 'dark';

    return `
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <!-- Brand / Logo -->
                <div class="flex items-center gap-3 cursor-pointer" onclick="window.store.setView('landing')">
                    <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                        <i data-lucide="atom" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <span class="font-bold text-lg text-slate-800 dark:text-white leading-tight block">انجمن فیزیک</span>
                        <span class="text-xs text-slate-500 dark:text-slate-400 block">دبیرستان شهید بهشتی ۲</span>
                    </div>
                </div>

                <!-- Nav Links for Desktop -->
                <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <a href="#curriculum" onclick="window.store.setView('curriculum')" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <i data-lucide="book-open" class="w-4 h-4"></i>
                        <span>برنامه درسی</span>
                    </a>
                    <a href="#competitions" onclick="window.store.setView('competitions')" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i>
                        <span>مسابقه هفتگی</span>
                    </a>
                    <a href="#leaderboards" onclick="window.store.setView('leaderboards')" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <i data-lucide="award" class="w-4 h-4 text-indigo-500"></i>
                        <span>جدول امتیازات</span>
                    </a>
                    <a href="#badges" onclick="window.store.setView('badges')" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <i data-lucide="medal" class="w-4 h-4 text-emerald-500"></i>
                        <span>مدال‌ها</span>
                    </a>
                    ${user && user.role === 'admin' ? `
                    <a href="#admin" onclick="window.store.setView('admin')" class="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1.5">
                        <i data-lucide="shield-alert" class="w-4 h-4"></i>
                        <span>پنل مدیریت</span>
                    </a>
                    ` : ''}
                </nav>

                <!-- User Stats & Actions -->
                <div class="flex items-center gap-3">
                    <!-- Theme Toggle -->
                    <button onclick="window.store.toggleTheme()" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors" title="تغییر تم">
                        <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>
                    </button>

                    ${user ? `
                    <!-- Streak -->
                    <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-200 dark:border-orange-900" title="استمرار روزانه">
                        <i data-lucide="flame" class="w-4 h-4 text-orange-500 streak-flame-active fill-orange-500"></i>
                        <span>${user.current_streak || 0} روز</span>
                    </div>

                    <!-- XP -->
                    <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900" title="امتیاز تجربه (XP)">
                        <i data-lucide="zap" class="w-4 h-4 text-amber-500 fill-amber-500"></i>
                        <span>${user.total_xp || 0} XP</span>
                    </div>

                    <!-- User Menu Button -->
                    <div class="relative">
                        <button onclick="window.store.setView('dashboard')" class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                ${user.display_name ? user.display_name.charAt(0) : 'د'}
                            </div>
                            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">${user.display_name}</span>
                        </button>
                    </div>

                    <!-- Logout Button -->
                    <button onclick="logout()" class="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="خروج از حساب">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                    </button>
                    ` : `
                    <!-- Login / Register Buttons -->
                    <button onclick="openAuthModal('login')" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 px-3 py-1.5">
                        ورود
                    </button>
                    <button onclick="openAuthModal('register')" class="btn-duo-green text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
                        عضویت دانش‌آموز
                    </button>
                    `}
                </div>
            </div>
        </div>
    </header>
    `;
}

window.renderNavbar = renderNavbar;

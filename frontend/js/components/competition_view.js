/**
 * Weekly Competition View Component («مسابقه هفتگی»)
 */
async function renderCompetitionsView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
    <div class="text-center py-12">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
    `;

    try {
        const comps = await window.api.getCompetitions();

        let compsHtml = '';
        if (comps.length === 0) {
            compsHtml = `
            <div class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <i data-lucide="trophy" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                <h3 class="font-bold text-slate-700 dark:text-slate-200 text-lg">در حال حاضر مسابقه فعالی وجود ندارد</h3>
                <p class="text-xs text-slate-400 mt-1">مسابقات جدید هر هفته در روزهای چهارشنبه اعلام می‌شوند.</p>
            </div>
            `;
        } else {
            compsHtml = comps.map(c => `
            <div class="physics-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${c.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                        ${c.is_active ? 'در حال برگزاری (فعال)' : c.is_closed ? 'پایان یافته' : 'به زودی'}
                    </span>
                    <span class="text-xs font-semibold text-slate-500">${c.grade_title_fa}</span>
                </div>

                <div>
                    <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-1">${c.title_fa}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${c.description_fa || ''}</p>
                </div>

                <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span class="flex items-center gap-1">
                        <i data-lucide="calendar" class="w-4 h-4 text-blue-500"></i>
                        مهلت: ${window.formatPersianDate(c.ends_at)}
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="users" class="w-4 h-4 text-emerald-500"></i>
                        ${c.participant_count} شرکت‌کننده
                    </span>
                </div>

                <div class="pt-2 flex items-center justify-between">
                    <div>
                        ${c.user_submitted ? `
                        <span class="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
                            پاسخ شما با نمره ${c.user_score} ثبت شده است
                        </span>
                        ` : ''}
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="openCompetitionModal(${c.id})" class="btn-duo-yellow text-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm">
                            ${c.is_active && !c.user_submitted ? 'شرکت در مسابقه' : 'مشاهده جزئیات و رده‌بندی'}
                        </button>
                    </div>
                </div>
            </div>
            `).join('');
        }

        container.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <!-- Hero Header -->
            <div class="text-center space-y-3">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    <i data-lucide="flame" class="w-4 h-4 text-amber-500 fill-amber-500"></i>
                    <span>چالش‌های علمی هفتگی شهید بهشتی ۲</span>
                </div>
                <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white">مسابقات هفتگی فیزیک</h1>
                <p class="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                    هر هفته با حل مسائل مفهومی و محاسباتی پیشرفته، دانش فیزیک خود را به چالش بکشید، نشان‌های ویژه دریافت کنید و در صدر رده‌بندی مدرسه بدرخشید!
                </p>
            </div>

            <!-- Competitions List -->
            <div class="space-y-6">
                ${compsHtml}
            </div>
        </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        container.innerHTML = `<div class="p-6 text-center text-rose-500 font-bold">${e.message}</div>`;
    }
}

async function openCompetitionModal(compId) {
    try {
        const comp = await window.api.getCompetition(compId);
        const board = await window.api.getCompetitionLeaderboard(compId).catch(() => []);

        const modalDiv = document.createElement('div');
        modalDiv.id = 'comp-active-modal';
        modalDiv.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';

        modalDiv.innerHTML = `
        <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                    <h3 class="font-bold text-lg text-slate-800 dark:text-white">${comp.title_fa}</h3>
                    <span class="text-xs text-slate-400">مهلت ارسال پاسخ: ${window.formatPersianDate(comp.ends_at)}</span>
                </div>
                <button onclick="document.getElementById('comp-active-modal').remove()" class="p-2 text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            ${comp.description_fa ? `<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${comp.description_fa}</p>` : ''}

            <!-- Questions Form if not submitted and active -->
            ${!comp.is_closed && !comp.user_submission && comp.questions.length > 0 ? `
            <form id="comp-submit-form" onsubmit="handleCompetitionSubmit(event, ${comp.id})" class="space-y-6">
                <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">سؤالات مسابقه:</h4>
                ${comp.questions.map((q, idx) => `
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <span class="text-xs font-bold text-blue-600 block">سؤال ${idx + 1} (${q.points} نمره)</span>
                    <p class="text-sm font-semibold text-slate-800 dark:text-white leading-relaxed">${q.prompt_fa}</p>

                    ${q.question_type === 'mcq' ? `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        ${q.options.map(opt => `
                        <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer text-xs">
                            <input type="radio" name="comp_q_${q.id}" value="${opt.option_key}" required class="text-blue-600" />
                            <span class="font-bold">${opt.option_key}:</span>
                            <span>${opt.text_fa}</span>
                        </label>
                        `).join('')}
                    </div>
                    ` : `
                    <textarea name="comp_q_${q.id}" rows="3" required placeholder="پاسخ تشریحی خود را اینجا بنویسید..."
                        class="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"></textarea>
                    `}
                </div>
                `).join('')}

                <div class="text-center pt-2">
                    <button type="submit" class="btn-duo-green text-white font-bold px-8 py-3 rounded-2xl text-xs shadow-md">
                        ثبت و ارسال پاسخ مسابقه
                    </button>
                </div>
            </form>
            ` : ''}

            <!-- Official Solution if published -->
            ${comp.solutions_published && comp.official_solution_fa ? `
            <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                <span class="font-bold block">پاسخ تشریحی و راهنمای رسمی مسابقه:</span>
                <p class="leading-relaxed text-justify">${comp.official_solution_fa}</p>
            </div>
            ` : ''}

            <!-- Leaderboard -->
            <div class="space-y-3 pt-2">
                <h4 class="font-bold text-sm text-slate-800 dark:text-white">جدول برترین‌های این مسابقه:</h4>
                <div class="space-y-2">
                    ${board.length === 0 ? '<p class="text-xs text-slate-400">هنوز پاسخی ثبت نشده است.</p>' : board.map(b => `
                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                        <div class="flex items-center gap-3">
                            <span class="w-6 h-6 rounded-full font-bold flex items-center justify-center ${b.rank === 1 ? 'bg-amber-400 text-slate-900' : b.rank === 2 ? 'bg-slate-300 text-slate-900' : b.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}">
                                ${b.rank}
                            </span>
                            <span class="font-semibold text-slate-800 dark:text-white">${b.display_name}</span>
                            <span class="text-slate-400 text-[11px]">(${b.grade_title_fa})</span>
                        </div>
                        <div class="font-bold text-blue-600 font-mono">
                            ${b.score} نمره
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(modalDiv);
        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        alert(e.message);
    }
}

async function handleCompetitionSubmit(e, compId) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const answers = {};

    for (let [key, val] of formData.entries()) {
        const qId = key.replace('comp_q_', '');
        answers[qId] = val;
    }

    try {
        const res = await window.api.submitCompetition(compId, answers);
        window.store.playSound('celebrate');
        alert(res.message_fa);
        const modal = document.getElementById('comp-active-modal');
        if (modal) modal.remove();
        renderCompetitionsView('app-main-content');
    } catch (err) {
        alert(err.message);
    }
}

window.renderCompetitionsView = renderCompetitionsView;
window.openCompetitionModal = openCompetitionModal;
window.handleCompetitionSubmit = handleCompetitionSubmit;

/**
 * Administration Portal Component (CMS, Question Bank, Review Center, AI Config, Validation)
 */
class AdminViews {
    constructor(containerId) {
        this.containerId = containerId;
        this.activeTab = 'overview'; // 'overview', 'validation', 'questions', 'reviews', 'ai', 'textbooks', 'students'
    }

    async render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <!-- Admin Top Bar -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <div class="flex items-center gap-2 text-rose-600 font-bold text-xs mb-1">
                        <i data-lucide="shield-check" class="w-4 h-4"></i>
                        <span>سامانه مدیریت انجمن فیزیک دبیرستان شهید بهشتی ۲</span>
                    </div>
                    <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">پنل جامع مدیریت آموزشی</h1>
                </div>

                <!-- Admin Tabs Navigation -->
                <div class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                    <button onclick="window.currentAdminViews.switchTab('overview')" class="px-3 py-2 rounded-xl transition-all ${this.activeTab === 'overview' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                        داشبورد
                    </button>
                    <button onclick="window.currentAdminViews.switchTab('validation')" class="px-3 py-2 rounded-xl transition-all ${this.activeTab === 'validation' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                        اعتبارسنجی سؤالات
                    </button>
                    <button onclick="window.currentAdminViews.switchTab('questions')" class="px-3 py-2 rounded-xl transition-all ${this.activeTab === 'questions' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                        بانک سؤالات
                    </button>
                    <button onclick="window.currentAdminViews.switchTab('reviews')" class="px-3 py-2 rounded-xl transition-all ${this.activeTab === 'reviews' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                        مرکز بازبینی و تصحیح
                    </button>
                    <button onclick="window.currentAdminViews.switchTab('ai')" class="px-3 py-2 rounded-xl transition-all ${this.activeTab === 'ai' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                        تنظیمات هوش مصنوعی
                    </button>
                    <button onclick="window.currentAdminViews.switchTab('textbooks')" class="px-3 py-2 rounded-xl transition-all ${this.activeTab === 'textbooks' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                        کتاب‌ها و استخراج PDF
                    </button>
                    <button onclick="window.currentAdminViews.switchTab('students')" class="px-3 py-2 rounded-xl transition-all ${this.activeTab === 'students' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                        دانش‌آموزان
                    </button>
                </div>
            </div>

            <!-- Tab Content Container -->
            <div id="admin-tab-content">
                <div class="text-center py-12"><div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            </div>
        </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        this.loadTabContent();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.render();
    }

    async loadTabContent() {
        const target = document.getElementById('admin-tab-content');
        if (!target) return;

        if (this.activeTab === 'overview') {
            const data = await window.api.getAdminOverview();
            target.innerHTML = `
            <div class="space-y-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span class="text-xs text-slate-400 font-bold block mb-1">دانش‌آموزان ثبت‌نامی</span>
                        <span class="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">${data.total_students}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span class="text-xs text-slate-400 font-bold block mb-1">کل پرسش‌های فعال</span>
                        <span class="text-3xl font-extrabold text-blue-600 font-mono">${data.total_questions}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span class="text-xs text-slate-400 font-bold block mb-1">آزمون‌های برگزار شده</span>
                        <span class="text-3xl font-extrabold text-indigo-600 font-mono">${data.total_attempts}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span class="text-xs text-slate-400 font-bold block mb-1">پاسخ‌های در صف بازبینی دبیر</span>
                        <span class="text-3xl font-extrabold text-amber-600 font-mono">${data.pending_written_reviews}</span>
                    </div>
                </div>

                <!-- Recent Activity Logs -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 class="font-bold text-base text-slate-800 dark:text-white">رویدادها و گزارش‌های امنیتی اخیر (Audit Logs)</h3>
                    <div class="divide-y divide-slate-100 dark:divide-slate-800">
                        ${data.recent_logs.map(l => `
                        <div class="py-3 flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">${l.action}</span>
                                <span class="text-slate-600 dark:text-slate-300">موجودیت: ${l.target_entity} (شناسه: ${l.target_id || '-'})</span>
                            </div>
                            <span class="text-slate-400 font-mono">${window.formatPersianTime(l.created_at)}</span>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            `;
        } else if (this.activeTab === 'validation') {
            const reports = await window.api.getValidationReport();
            const allPassed = reports.every(r => r.is_fully_compliant);

            target.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                        <h2 class="text-lg font-bold text-slate-800 dark:text-white">گزارش خودکار انطباق محتوای آموزشی و بانک سؤالات</h2>
                        <p class="text-xs text-slate-500">بررسی حد نصاب الزامی: حداقل ۲۰ سؤال چهارگزینه‌ای معتبر و ۱۰ سؤال تشریحی بارم‌بندی‌شده به ازای تک‌تک فصل‌ها</p>
                    </div>
                    <div class="px-4 py-2 rounded-xl text-xs font-bold ${allPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                        ${allPassed ? 'تأیید کامل تمامی ۱۲ فصل (PASS)' : 'عدم انطباق برخی فصول'}
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-right text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                                <th class="p-3">پایه</th>
                                <th class="p-3">فصل</th>
                                <th class="p-3">عنوان فصل فیزیک</th>
                                <th class="p-3 text-center">چهارگزینه‌ای (حداقل ۲۰)</th>
                                <th class="p-3 text-center">تشریحی (حداقل ۱۰)</th>
                                <th class="p-3 text-center">وضعیت انطباق</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                            ${reports.map(r => `
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td class="p-3 font-bold">پایه ${r.grade_number}</td>
                                <td class="p-3">فصل ${r.chapter_number}</td>
                                <td class="p-3 font-bold">${r.chapter_title_fa}</td>
                                <td class="p-3 text-center font-mono font-bold ${r.actual_valid_mcq_count >= 20 ? 'text-emerald-600' : 'text-rose-600'}">
                                    ${r.actual_valid_mcq_count} / ۲۰
                                </td>
                                <td class="p-3 text-center font-mono font-bold ${r.actual_valid_written_count >= 10 ? 'text-emerald-600' : 'text-rose-600'}">
                                    ${r.actual_valid_written_count} / ۱۰
                                </td>
                                <td class="p-3 text-center">
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${r.is_fully_compliant ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                                        <i data-lucide="${r.is_fully_compliant ? 'check' : 'x'}" class="w-3.5 h-3.5"></i>
                                        ${r.is_fully_compliant ? 'تأیید شد' : 'ناقص'}
                                    </span>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            `;
        } else if (this.activeTab === 'questions') {
            const data = await window.api.getQuestions({ limit: 50 });
            target.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-base text-slate-800 dark:text-white">فهرست و جستجوی بانک سؤالات (${data.total} پرسش ثبت شده)</h3>
                </div>

                <div class="space-y-3">
                    ${data.questions.map(q => `
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded font-bold text-[11px] ${q.question_type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
                                    ${q.question_type === 'mcq' ? 'تستی' : 'تشریحی'}
                                </span>
                                <span class="text-slate-500 font-semibold">${q.chapter_title_fa} (پایه ${q.grade_number})</span>
                            </div>
                            <span class="text-slate-400 font-mono text-[11px]">${q.points} نمره</span>
                        </div>
                        <p class="text-xs font-semibold text-slate-800 dark:text-white leading-relaxed">${q.prompt_fa}</p>
                        ${q.source_ref ? `<span class="text-[11px] text-slate-400 block">مرجع: ${q.source_ref}</span>` : ''}
                    </div>
                    `).join('')}
                </div>
            </div>
            `;
        } else if (this.activeTab === 'reviews') {
            const queue = await window.api.getWrittenQueue();
            target.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                    <h3 class="font-bold text-base text-slate-800 dark:text-white">صف بازبینی و تصحیح نمرات تشریحی توسط دبیر</h3>
                    <p class="text-xs text-slate-500 mt-1">مشاهده پیشنهاد هوش مصنوعی، تأیید یا ویرایش نمره با ثبت در دفترچه ممیزی (Audit)</p>
                </div>

                <div class="space-y-4">
                    ${queue.length === 0 ? '<p class="text-xs text-slate-400 py-6 text-center">هیچ پاسخی در صف بازبینی نیست.</p>' : queue.map(item => `
                    <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-bold text-slate-700 dark:text-slate-200">${item.student_name} • ${item.exam_title_fa}</span>
                            <span class="px-2.5 py-1 rounded-full font-bold ${item.review_status === 'pending_review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
                                وضعیت: ${item.review_status === 'pending_review' ? 'نیازمند بررسی دبیر' : 'تأیید شده'}
                            </span>
                        </div>

                        <div class="text-xs space-y-1">
                            <div class="font-bold text-slate-800 dark:text-white">سؤال: ${item.question_prompt_fa}</div>
                            <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <span class="font-bold block mb-1">پاسخ دانش‌آموز:</span>
                                ${item.student_response_text || 'بدون پاسخ'}
                            </div>
                            <div class="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
                                <span class="font-bold block mb-1">پاسخ مرجع کتاب درسی:</span>
                                ${item.reference_answer_fa}
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                            <div class="font-bold text-slate-700 dark:text-slate-200">
                                نمره پیشنهادی هوش مصنوعی: <span class="font-mono text-blue-600">${item.ai_score}</span> از ${item.max_score}
                            </div>
                            <button onclick="window.currentAdminViews.openOverrideModal(${item.student_answer_id}, ${item.final_score}, ${item.max_score})" class="btn-duo-blue text-white font-bold px-4 py-1.5 rounded-xl text-xs">
                                ویرایش و اعمال نظر دبیر
                            </button>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            `;
        } else if (this.activeTab === 'ai') {
            const aiConf = await window.api.getAiConfig();
            target.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
                <div>
                    <h3 class="font-bold text-lg text-slate-800 dark:text-white">پیکربندی ارائه‌دهنده هوش مصنوعی (AI Provider)</h3>
                    <p class="text-xs text-slate-500 mt-1">پشتیبانی مستقل از انواع ارائه‌دهندگان (OpenAI, DeepSeek, OpenRouter, Ollama و Mock آزمایشی)</p>
                </div>

                <form onsubmit="window.currentAdminViews.saveAiConfig(event)" class="space-y-4 text-xs font-semibold">
                    <div>
                        <label class="block text-slate-600 dark:text-slate-300 mb-1">نوع ارائه‌دهنده (Provider):</label>
                        <select id="ai-provider" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                            <option value="mock" ${aiConf.provider_name === 'mock' ? 'selected' : ''}>شبیه‌ساز داخلی (Mock - بدون نیاز به اینترنت و کلید)</option>
                            <option value="openai" ${aiConf.provider_name === 'openai' ? 'selected' : ''}>OpenAI (سازگار با ChatGPT)</option>
                            <option value="openrouter" ${aiConf.provider_name === 'openrouter' ? 'selected' : ''}>OpenRouter (دسترسی به تمام مدل‌ها)</option>
                            <option value="deepseek" ${aiConf.provider_name === 'deepseek' ? 'selected' : ''}>DeepSeek API</option>
                            <option value="ollama" ${aiConf.provider_name === 'ollama' ? 'selected' : ''}>Ollama (مدل محلی روی سرور)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-slate-600 dark:text-slate-300 mb-1">نشانی پایه API (Base URL):</label>
                        <input type="text" id="ai-base-url" value="${aiConf.base_url}" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono" />
                    </div>

                    <div>
                        <label class="block text-slate-600 dark:text-slate-300 mb-1">شناسه مدل (Model Name):</label>
                        <input type="text" id="ai-model-name" value="${aiConf.model_name}" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono" />
                    </div>

                    <div>
                        <label class="block text-slate-600 dark:text-slate-300 mb-1">کلید دسترسی (API Key) - نگهداری امن در سرور:</label>
                        <input type="password" id="ai-api-key" placeholder="${aiConf.api_key_masked}" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono" />
                    </div>

                    <div class="flex items-center gap-3 pt-4">
                        <button type="submit" class="btn-duo-green text-white font-bold px-6 py-2.5 rounded-xl shadow-sm">
                            ذخیره تنظیمات
                        </button>
                        <button type="button" onclick="window.currentAdminViews.runAiConnectionTest()" class="btn-duo-blue text-white font-bold px-6 py-2.5 rounded-xl shadow-sm">
                            تست اتصال زنده
                        </button>
                    </div>
                </form>

                <div id="ai-test-result" class="hidden p-4 rounded-2xl text-xs font-semibold"></div>
            </div>
            `;
        } else if (this.activeTab === 'textbooks') {
            const grades = await window.api.getGrades();
            let allBooks = [];
            for (let g of grades) {
                const bks = await window.api.getBooks(g.id);
                allBooks = allBooks.concat(bks);
            }

            target.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                    <h3 class="font-bold text-base text-slate-800 dark:text-white">مدیریت کتاب‌های درسی و بارگذاری دستی PDF</h3>
                    <p class="text-xs text-slate-500 mt-1">وضعیت پردازش ۶ منبع رسمی و سمپاد، استخراج خودکار سرفصل‌ها و آپلود جایگزین</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    ${allBooks.map(b => `
                    <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-bold text-slate-800 dark:text-white">${b.title_fa}</span>
                            <span class="px-2 py-0.5 rounded-full font-bold ${b.source_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                                ${b.source_status === 'completed' ? 'پردازش شده' : 'در انتظار'}
                            </span>
                        </div>
                        <div class="text-[11px] text-slate-400 space-y-1">
                            <div>کد منبع: <span class="font-mono">${b.code}</span></div>
                            <div>تعداد صفحات: ${b.page_count} صفحه</div>
                            <div>ناشر: ${b.publisher_fa}</div>
                        </div>

                        <!-- Manual PDF Upload Form -->
                        <form onsubmit="window.currentAdminViews.uploadManualPdf(event, ${b.id})" class="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <input type="file" name="pdf_file" accept=".pdf" required class="text-xs text-slate-400 file:px-2 file:py-1 file:rounded-lg file:border-0 file:bg-slate-200 file:text-xs" />
                            <button type="submit" class="btn-duo-blue text-white px-3 py-1 rounded-lg text-xs font-bold">
                                آپلود PDF
                            </button>
                        </form>
                    </div>
                    `).join('')}
                </div>
            </div>
            `;
        } else if (this.activeTab === 'students') {
            const students = await window.api.getStudents();
            target.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 class="font-bold text-base text-slate-800 dark:text-white">مدیریت حساب‌های کاربری دانش‌آموزان</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-right text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                                <th class="p-3">نام و نام خانوادگی</th>
                                <th class="p-3">نام کاربری</th>
                                <th class="p-3">پایه تحصیلی</th>
                                <th class="p-3">امتیاز (XP)</th>
                                <th class="p-3">استمرار (روز)</th>
                                <th class="p-3">وضعیت</th>
                                <th class="p-3 text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            ${students.map(s => `
                            <tr>
                                <td class="p-3 font-bold text-slate-800 dark:text-white">${s.full_name}</td>
                                <td class="p-3 font-mono text-slate-500">${s.username}</td>
                                <td class="p-3">${s.grade_title_fa}</td>
                                <td class="p-3 font-mono font-bold text-blue-600">${s.total_xp}</td>
                                <td class="p-3 font-mono text-orange-500">${s.streak}</td>
                                <td class="p-3">
                                    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                                        ${s.is_active ? 'فعال' : 'مسدود'}
                                    </span>
                                </td>
                                <td class="p-3 text-center">
                                    <button onclick="window.currentAdminViews.toggleStudent(${s.id})" class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600">
                                        ${s.is_active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                                    </button>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            `;
        }

        if (window.lucide) window.lucide.createIcons();
    }

    openOverrideModal(answerId, currentScore, maxScore) {
        const modal = document.createElement('div');
        modal.id = 'override-score-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
        modal.innerHTML = `
        <div class="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 class="font-bold text-base text-slate-800 dark:text-white">ویرایش نمره پاسخ تشریحی</h3>
            <form onsubmit="window.currentAdminViews.submitOverride(event, ${answerId})" class="space-y-4 text-xs font-semibold">
                <div>
                    <label class="block text-slate-600 dark:text-slate-300 mb-1">نمره جدید (حداکثر ${maxScore}):</label>
                    <input type="number" step="0.25" min="0" max="${maxScore}" id="override-new-score" value="${currentScore}" required
                        class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono" />
                </div>
                <div>
                    <label class="block text-slate-600 dark:text-slate-300 mb-1">دلیل تغییر نمره (جهت ثبت در دفترچه ممیزی):</label>
                    <textarea id="override-reason" rows="3" required placeholder="توضیح دلیل اصلاح نمره..."
                        class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"></textarea>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                    <button type="button" onclick="document.getElementById('override-score-modal').remove()" class="px-4 py-2 rounded-xl text-slate-500">
                        انصراف
                    </button>
                    <button type="submit" class="btn-duo-green text-white font-bold px-6 py-2 rounded-xl">
                        ثبت تغییر نمره
                    </button>
                </div>
            </form>
        </div>
        `;
        document.body.appendChild(modal);
    }

    async submitOverride(e, answerId) {
        e.preventDefault();
        const score = parseFloat(document.getElementById('override-new-score').value);
        const reason = document.getElementById('override-reason').value.trim();

        try {
            await window.api.overrideGrade(answerId, score, reason);
            alert('نمره با موفقیت اصلاح شد.');
            document.getElementById('override-score-modal').remove();
            this.loadTabContent();
        } catch (err) {
            alert(err.message);
        }
    }

    async saveAiConfig(e) {
        e.preventDefault();
        const payload = {
            provider_name: document.getElementById('ai-provider').value,
            base_url: document.getElementById('ai-base-url').value,
            model_name: document.getElementById('ai-model-name').value,
            api_key: document.getElementById('ai-api-key').value,
            timeout_seconds: 45,
            max_retries: 2
        };

        try {
            await window.api.updateAiConfig(payload);
            alert('تنظیمات هوش مصنوعی با موفقیت ذخیره شد.');
        } catch (err) {
            alert(err.message);
        }
    }

    async runAiConnectionTest() {
        const box = document.getElementById('ai-test-result');
        box.className = 'p-4 rounded-2xl text-xs font-semibold bg-slate-100 text-slate-600 block';
        box.innerText = 'در حال برقراری ارتباط آزمایشی با سرویس هوش مصنوعی...';

        try {
            const res = await window.api.testAiConnection();
            if (res.success) {
                box.className = 'p-4 rounded-2xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 block';
                box.innerHTML = `✓ ${res.message_fa} (زمان پاسخ: ${res.latency_ms} میلی‌ثانیه)`;
            } else {
                box.className = 'p-4 rounded-2xl text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 block';
                box.innerHTML = `✕ ${res.message_fa}`;
            }
        } catch (err) {
            box.className = 'p-4 rounded-2xl text-xs font-semibold bg-rose-100 text-rose-800 block';
            box.innerText = err.message;
        }
    }

    async toggleStudent(userId) {
        if (!confirm('آیا از تغییر وضعیت این کاربر اطمینان دارید؟')) return;
        try {
            await window.api.toggleStudentStatus(userId);
            this.loadTabContent();
        } catch (err) {
            alert(err.message);
        }
    }

    async uploadManualPdf(e, bookId) {
        e.preventDefault();
        const form = e.target;
        const fileInput = form.querySelector('input[type="file"]');
        if (!fileInput.files[0]) return;

        const formData = new FormData();
        formData.append('book_id', bookId);
        formData.append('file', fileInput.files[0]);

        try {
            const res = await window.api.uploadTextbook(formData);
            alert(res.message_fa);
            this.loadTabContent();
        } catch (err) {
            alert(err.message);
        }
    }
}

window.AdminViews = AdminViews;

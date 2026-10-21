/**
 * API Client with JWT Bearer Interceptor and Persian Error Formatting
 */
const API_BASE = '/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders(contentType = 'application/json') {
        const headers = {};
        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = { ...this.getHeaders(options.isFormData ? null : 'application/json'), ...options.headers };

        const config = {
            method: options.method || 'GET',
            headers: headers,
        };

        if (options.body) {
            config.body = options.isFormData ? options.body : JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized (expired session)
            if (response.status === 401) {
                this.setToken(null);
                if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
                    window.dispatchEvent(new CustomEvent('auth-expired'));
                }
                throw new Error('جلسه کاری شما به پایان رسیده است. لطفاً دوباره وارد شوید.');
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMsg = data.detail || 'خطایی در ارتباط با سرور رخ داد.';
                throw new Error(errorMsg);
            }

            return data;
        } catch (err) {
            console.error(`API Error on ${endpoint}:`, err);
            throw err;
        }
    }

    // Auth
    login(username, password) {
        return this.request('/auth/login', { method: 'POST', body: { username, password } });
    }
    register(payload) {
        return this.request('/auth/register', { method: 'POST', body: payload });
    }
    getCurrentUser() {
        return this.request('/auth/me');
    }
    updateProfile(payload) {
        return this.request('/auth/profile', { method: 'PUT', body: payload });
    }

    // Curriculum
    getGrades() {
        return this.request('/curriculum/grades');
    }
    getBooks(gradeId) {
        return this.request(`/curriculum/grades/${gradeId}/books`);
    }
    getChapters(bookId) {
        return this.request(`/curriculum/books/${bookId}/chapters`);
    }
    getChapter(chapterId) {
        return this.request(`/curriculum/chapters/${chapterId}`);
    }
    getLesson(lessonId) {
        return this.request(`/curriculum/lessons/${lessonId}`);
    }
    submitExercise(exerciseId, answer) {
        return this.request('/curriculum/exercises/submit', {
            method: 'POST',
            body: { exercise_id: exerciseId, submitted_answer: answer }
        });
    }
    completeLesson(lessonId) {
        return this.request(`/curriculum/lessons/${lessonId}/complete`, { method: 'POST' });
    }

    // Exams
    getExams(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.request(`/exams${qs ? '?' + qs : ''}`);
    }
    getExam(examId) {
        return this.request(`/exams/${examId}`);
    }
    startExam(examId) {
        return this.request(`/exams/${examId}/start`, { method: 'POST' });
    }
    submitExam(attemptId, answers) {
        return this.request('/exams/submit', {
            method: 'POST',
            body: { attempt_id: attemptId, answers: answers }
        });
    }
    getAttempt(attemptId) {
        return this.request(`/exams/attempts/${attemptId}`);
    }
    getMyExamHistory() {
        return this.request('/exams/my-history');
    }

    // Competitions
    getCompetitions() {
        return this.request('/competitions');
    }
    getCompetition(compId) {
        return this.request(`/competitions/${compId}`);
    }
    submitCompetition(compId, answers) {
        return this.request(`/competitions/${compId}/submit`, {
            method: 'POST',
            body: { competition_id: compId, answers: answers }
        });
    }
    getCompetitionLeaderboard(compId) {
        return this.request(`/competitions/${compId}/leaderboard`);
    }

    // Gamification
    getDashboard() {
        return this.request('/gamification/dashboard');
    }
    getLeaderboards(gradeId = null) {
        const qs = gradeId ? `?grade_id=${gradeId}` : '';
        return this.request(`/gamification/leaderboards${qs}`);
    }
    getBadges() {
        return this.request('/gamification/badges');
    }
    getXpHistory() {
        return this.request('/gamification/xp-history');
    }

    // Admin
    getAdminOverview() {
        return this.request('/admin/overview');
    }
    getValidationReport() {
        return this.request('/admin/validation-report');
    }
    getQuestions(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.request(`/admin/questions?${qs}`);
    }
    getWrittenQueue() {
        return this.request('/admin/reviews/written-queue');
    }
    overrideGrade(studentAnswerId, newScore, reason) {
        return this.request('/admin/reviews/override', {
            method: 'POST',
            body: { student_answer_id: studentAnswerId, new_score: newScore, reason: reason }
        });
    }
    getAiConfig() {
        return this.request('/admin/ai/config');
    }
    updateAiConfig(payload) {
        return this.request('/admin/ai/config', { method: 'POST', body: payload });
    }
    testAiConnection() {
        return this.request('/admin/ai/test-connection', { method: 'POST' });
    }
    getStudents(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.request(`/admin/students?${qs}`);
    }
    toggleStudentStatus(userId) {
        return this.request(`/admin/students/${userId}/toggle-status`, { method: 'POST' });
    }
    uploadTextbook(formData) {
        return this.request('/admin/textbooks/upload', {
            method: 'POST',
            body: formData,
            isFormData: true
        });
    }
    processTextbook(sourceId) {
        return this.request(`/admin/textbooks/${sourceId}/process`, { method: 'POST' });
    }

    // Public Stats
    getPublicStats() {
        return this.request('/system/stats');
    }
}

window.api = new ApiClient();

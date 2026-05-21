const authModalTemplate = `
<div id="login-modal" class="fixed inset-0 bg-slate-900/75 hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-900">Đăng nhập</h2>
            <button id="close-login" class="text-slate-500 hover:text-slate-900 text-2xl leading-none">&times;</button>
        </div>
        <div class="px-6 py-6">
            <label class="block text-sm font-medium text-slate-700">Email</label>
            <input id="login-email" type="email" placeholder="Nhập email" class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#3c6ad3] focus:outline-none" />
            <label class="block text-sm font-medium text-slate-700 mt-4">Mật khẩu</label>
            <input id="login-password" type="password" placeholder="Nhập mật khẩu" class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#3c6ad3] focus:outline-none" />
            <button id="login-submit" class="mt-6 w-full rounded-full bg-[#3c6ad3] px-4 py-3 text-white font-semibold hover:bg-blue-600 transition">Đăng nhập</button>
            <p class="mt-4 text-sm text-slate-500">Chưa có tài khoản? <button id="open-signup-from-login" class="text-[#3c6ad3] hover:text-blue-600 font-semibold">Đăng Ký</button></p>
            <p class="mt-2 text-sm text-slate-500">Hoặc <a href="#" class="text-[#3c6ad3] hover:text-blue-600">quên mật khẩu?</a></p>
        </div>
    </div>
</div>

<div id="signup-modal" class="fixed inset-0 bg-slate-900/75 hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-900">Đăng ký</h2>
            <button id="close-signup" class="text-slate-500 hover:text-slate-900 text-2xl leading-none">&times;</button>
        </div>
        <div class="px-6 py-6">
            <label class="block text-sm font-medium text-slate-700">Họ và Tên</label>
            <input id="signup-name" type="text" placeholder="Nhập họ và tên" class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#3c6ad3] focus:outline-none" />
            <label class="block text-sm font-medium text-slate-700 mt-4">Email</label>
            <input id="signup-email" type="email" placeholder="Nhập email" class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#3c6ad3] focus:outline-none" />
            <label class="block text-sm font-medium text-slate-700 mt-4">Mật khẩu</label>
            <input id="signup-password" type="password" placeholder="Nhập mật khẩu" class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#3c6ad3] focus:outline-none" />
            <label class="block text-sm font-medium text-slate-700 mt-4">Xác nhận mật khẩu</label>
            <input id="signup-password-confirm" type="password" placeholder="Xác nhận mật khẩu" class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#3c6ad3] focus:outline-none" />
            <button id="signup-submit" class="mt-6 w-full rounded-full bg-[#3c6ad3] px-4 py-3 text-white font-semibold hover:bg-blue-600 transition">Đăng ký</button>
            <p class="mt-4 text-sm text-slate-500">Đã có tài khoản? <button id="open-login-from-signup" class="text-[#3c6ad3] hover:text-blue-600 font-semibold">Đăng Nhập</button></p>
        </div>
    </div>
</div>
`;

function showModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideModal(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function initializeAuthModals() {
    document.body.insertAdjacentHTML('beforeend', authModalTemplate);

    const openLogin = document.getElementById('open-login');
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.getElementById('close-login');
    const openSignupFromLogin = document.getElementById('open-signup-from-login');
    const signupModal = document.getElementById('signup-modal');
    const closeSignup = document.getElementById('close-signup');
    const openLoginFromSignup = document.getElementById('open-login-from-signup');

    if (!openLogin || !loginModal || !closeLogin || !signupModal || !closeSignup) {
        return;
    }

    openLogin.addEventListener('click', () => {
        showModal(loginModal);
    });

    closeLogin.addEventListener('click', () => {
        hideModal(loginModal);
    });

    openSignupFromLogin?.addEventListener('click', () => {
        hideModal(loginModal);
        showModal(signupModal);
    });

    closeSignup.addEventListener('click', () => {
        hideModal(signupModal);
    });

    openLoginFromSignup?.addEventListener('click', () => {
        hideModal(signupModal);
        showModal(loginModal);
    });

    [loginModal, signupModal].forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                hideModal(modal);
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthModals);
} else {
    initializeAuthModals();
}

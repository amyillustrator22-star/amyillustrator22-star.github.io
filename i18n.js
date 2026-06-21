/*
 * Shared i18n engine for Amy Software Arcade Center.
 * Detects the browser language (English vs. Spanish, defaulting to Spanish)
 * and exposes window.t(key) for both static markup (via data-i18n attributes)
 * and dynamic strings used inside each page's own script (alerts, prompts,
 * canvas text, etc). Each page defines its own window.AMY_DICT = { key: { es, en } }
 * before this script and/or before calling t().
 */
(function () {
    function detectLang() {
        var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'es'];
        for (var i = 0; i < langs.length; i++) {
            var code = (langs[i] || '').toLowerCase();
            if (code.indexOf('en') === 0) return 'en';
            if (code.indexOf('es') === 0) return 'es';
        }
        return 'es';
    }

    var lang = detectLang();
    document.documentElement.lang = lang;
    window.AMY_LANG = lang;

    window.t = function (key) {
        var dict = window.AMY_DICT || {};
        var entry = dict[key];
        if (!entry) return key;
        return entry[lang] !== undefined ? entry[lang] : (entry.es !== undefined ? entry.es : key);
    };

    function applyStaticI18n() {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            el.textContent = window.t(el.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = window.t(el.getAttribute('data-i18n-placeholder'));
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            el.innerHTML = window.t(el.getAttribute('data-i18n-html'));
        });
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            el.title = window.t(el.getAttribute('data-i18n-title'));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyStaticI18n);
    } else {
        applyStaticI18n();
    }

    window.AMY_I18N_APPLY = applyStaticI18n;
})();

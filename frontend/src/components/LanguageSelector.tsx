import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value).catch(() => undefined);
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
      <label htmlFor="language-select">{t('language.label')}</label>
      <select
        id="language-select"
        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1 text-slate-100 focus:border-primary focus:outline-none"
        value={i18n.language}
        onChange={handleChange}
      >
        <option value="ru">{t('language.options.ru')}</option>
        <option value="en">{t('language.options.en')}</option>
      </select>
    </div>
  );
};

export default LanguageSelector;

import { h } from 'preact';
import { t, setLanguage, getLanguage, type Language } from '../../lib/i18n';
import { Button } from '../components/Button';

export interface HeaderProps {
  onNewTask: () => void;
  onOpenArchive: () => void;
  onOpenColumns: () => void;
}

export function Header({ onNewTask, onOpenArchive, onOpenColumns }: HeaderProps) {
  const lang = getLanguage();

  const handleLanguageChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setLanguage(target.value as Language);
  };

  return (
    <header class="header">
      <div class="header-content">
        <h1>{t('header.title')}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={lang}
            onChange={handleLanguageChange}
            style={{
              padding: '0.6rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="en">{t('language.en')}</option>
            <option value="fr">{t('language.fr')}</option>
          </select>
          <Button onClick={onNewTask} variant="secondary">
            {t('header.newTask')}
          </Button>
          <Button onClick={onOpenArchive} variant="secondary">
            {t('header.archives')}
          </Button>
          <Button onClick={onOpenColumns} variant="secondary">
            {t('header.columns')}
          </Button>
        </div>
      </div>
    </header>
  );
}

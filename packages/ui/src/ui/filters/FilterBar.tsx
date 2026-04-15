import { h } from 'preact';
import { t } from '../../lib/i18n';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import {
  activeFiltersSignal,
  searchTermSignal,
  configSignal,
  archivedTasksSignal,
  normalizeUserId,
  tasksSignal,
} from '../../signals/state';

export function FilterBar() {
  const config = configSignal.value;
  const filters = activeFiltersSignal.value;
  const searchTerm = searchTermSignal.value;

  // Collect all unique values from tasks and archived tasks
  const allTasks = [...tasksSignal.value, ...archivedTasksSignal.value];
  const allTags = Array.from(new Set([...config.tags, ...allTasks.flatMap(t => t.tags)]));
  const allCategories = Array.from(
    new Set([...config.categories, ...allTasks.map(t => t.category).filter(Boolean)])
  );
  const allUsers = Array.from(new Set([...config.users, ...allTasks.flatMap(t => t.assignees)]));
  const allPriorities = Array.from(
    new Set([...config.priorities, ...allTasks.map(t => t.priority).filter(Boolean)])
  );

  const addFilter = (type: string, value: string) => {
    if (value) {
      activeFiltersSignal.value = [...filters, { type, value }];
    }
  };

  const removeFilter = (index: number) => {
    activeFiltersSignal.value = filters.filter((_, i) => i !== index);
  };

  const clearAllFilters = () => {
    activeFiltersSignal.value = [];
    searchTermSignal.value = '';
  };

  const handleSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    searchTermSignal.value = target.value;
  };

  const clearSearch = () => {
    searchTermSignal.value = '';
  };

  return (
    <div class="filter-bar">
      <div class="filter-bar-content">
        {/* Global Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
            <label
              htmlFor="globalSearchInput"
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              {t('filters.search')}
            </label>
            <input
              type="text"
              id="globalSearchInput"
              placeholder={t('filters.search')}
              style={{
                width: '100%',
                padding: '0.75rem 3rem 0.75rem 1rem',
                border: '2px solid #cbd5e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
              }}
              onInput={handleSearchInput}
              value={searchTerm}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#718096',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.5rem',
                }}
                title={t('filters.searchClear') || 'Clear search'}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter dropdowns */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '0.75rem',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="filter.tags" style={{ fontWeight: 500, fontSize: '0.9rem' }}>
              {t('filters.tags')}:
            </label>
            <select
              id="filter.tags"
              style={{
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                minWidth: '150px',
              }}
              onChange={e => {
                const target = e.target as HTMLSelectElement;
                addFilter('tag', target.value);
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="filter.category" style={{ fontWeight: 500, fontSize: '0.9rem' }}>
              {t('filters.category')}:
            </label>
            <select
              id="filter.category"
              style={{
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                minWidth: '150px',
              }}
              onChange={e => {
                const target = e.target as HTMLSelectElement;
                addFilter('category', target.value);
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="filter.user" style={{ fontWeight: 500, fontSize: '0.9rem' }}>
              {t('filters.user')}:
            </label>
            <select
              id="filter.user"
              style={{
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                minWidth: '150px',
              }}
              onChange={e => {
                const target = e.target as HTMLSelectElement;
                addFilter('user', normalizeUserId(target.value));
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {allUsers.map(user => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="filter.priority" style={{ fontWeight: 500, fontSize: '0.9rem' }}>
              {t('filters.priority')}:
            </label>
            <select
              id="filter.priority"
              style={{
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                minWidth: '150px',
              }}
              onChange={e => {
                const target = e.target as HTMLSelectElement;
                addFilter('priority', target.value);
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {allPriorities.map(pri => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
          </div>

          {filters.length > 0 && (
            <Button onClick={clearAllFilters} variant="secondary" title={t('filters.clearAll')}>
              {t('filters.clearAll')}
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {filters.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {filters.map((filter, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#E3F2FD',
                  color: '#1565C0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                }}
              >
                {filter.type === 'tag' && '#'}
                {filter.value}
                <button
                  onClick={() => removeFilter(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

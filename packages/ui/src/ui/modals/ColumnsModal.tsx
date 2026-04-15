import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { Column } from '@mdflow/types';
import { t } from '../../lib/i18n';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { configSignal, columnsModalOpenSignal } from '../../signals/state';

export function ColumnsModal() {
  const isOpen = columnsModalOpenSignal.value;
  const config = configSignal.value;
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    if (isOpen) {
      setColumns([...config.columns]);
    }
  }, [isOpen, config.columns]);

  if (!isOpen) return null;

  const handleClose = () => {
    columnsModalOpenSignal.value = false;
    setColumns([...configSignal.value.columns]);
  };

  const handleSave = () => {
    configSignal.value = { ...config, columns: columns };
    handleClose();
  };

  const handleAdd = () => {
    const name = prompt(t('prompt.columnName'));
    if (!name) return;
    const id = prompt(t('prompt.columnId'));
    if (!id) return;
    setColumns([...columns, { name, id }]);
  };

  const handleDelete = (index: number) => {
    if (confirm(t('confirm.deleteColumn'))) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...columns];
    [newColumns[index - 1], newColumns[index]] = [newColumns[index], newColumns[index - 1]];
    setColumns(newColumns);
  };

  const handleMoveDown = (index: number) => {
    if (index === columns.length - 1) return;
    const newColumns = [...columns];
    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    setColumns(newColumns);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('columns.title')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {columns.map((col, index) => (
          <div
            key={col.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{index + 1}.</span>
            <span style={{ flex: 1 }}>
              {col.name} ({col.id})
            </span>
            <Button onClick={() => handleMoveUp(index)} variant="secondary" disabled={index === 0}>
              ↑
            </Button>
            <Button
              onClick={() => handleMoveDown(index)}
              variant="secondary"
              disabled={index === columns.length - 1}
            >
              ↓
            </Button>
            <Button
              onClick={() => handleDelete(index)}
              variant="secondary"
              style={{ color: '#EF4444' }}
            >
              🗑️
            </Button>
          </div>
        ))}
      </div>
      <div class="actions">
        <Button onClick={handleAdd} variant="secondary">
          {t('columns.add')}
        </Button>
        <Button onClick={handleSave} variant="primary">
          {t('taskForm.save')}
        </Button>
      </div>
    </Modal>
  );
}

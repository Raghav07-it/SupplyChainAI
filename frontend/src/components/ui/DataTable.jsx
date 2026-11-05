import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';

export const DataTable = ({ columns, data, loading, emptyMessage }) => {
  if (loading) return <LoadingSpinner />;
  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage || 'No records available.'} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
      <table className="cs-table w-full">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.accessor || idx}
                className={`${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
              >
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((col, idx) => (
                <td
                  key={col.accessor || idx}
                  className={`${col.align === 'right' ? 'text-right' : 'text-left'} ${col.cellClassName || ''}`}
                >
                  {col.Cell ? col.Cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

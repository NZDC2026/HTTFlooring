import { GripVertical } from "lucide-react";

interface ColumnControlsProps {
    columns: { id: string; label: string; visible: boolean; locked?: boolean }[];
    onChange: (id: string, visible: boolean) => void;
    onMove?: (source: string, target: string) => void;
    onReset: () => void;
}

export function ColumnControls({ columns, onChange, onMove, onReset }: ColumnControlsProps) {
    const visibleCount = columns.filter(column => column.visible && !column.locked).length;
    return <details className="relative print:hidden">
        <summary className="cursor-pointer rounded-lg border px-3 py-2 text-sm">View columns</summary>
        <div className="absolute right-0 z-30 mt-2 max-h-80 min-w-56 overflow-auto rounded-lg border bg-white p-3 shadow-lg">
            <p className="mb-2 text-xs text-slate-600">{onMove ? "Drag the handles to reorder columns." : "Changes apply to this view."}</p>
            {columns.map((column, index) => <div key={column.id}
                className="flex items-center gap-2 py-1"
                onDragOver={event => {
                    if (onMove && event.dataTransfer.types.includes("application/x-htt-column")) event.preventDefault();
                }}
                onDrop={event => {
                    event.preventDefault();
                    onMove?.(event.dataTransfer.getData("application/x-htt-column"), column.id);
                }}
            >
                {onMove && <button type="button" draggable
                    className="cursor-grab text-[var(--color-text-secondary)]"
                    aria-label={`Move ${column.label} with Up or Down arrow`}
                    title="Drag to reorder or use Up and Down"
                    onDragStart={event => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("application/x-htt-column", column.id);
                    }}
                    onKeyDown={event => {
                        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                        event.preventDefault();
                        const target = columns[index + (event.key === "ArrowUp" ? -1 : 1)];
                        if (target) onMove(column.id, target.id);
                    }}
                ><GripVertical size={14} aria-hidden="true"/></button>}
                <label className="flex gap-2 text-sm">
                    <input type="checkbox" aria-label={`Show ${column.label}`} checked={column.visible}
                        disabled={column.locked || column.visible && visibleCount <= 1}
                        onChange={event => onChange(column.id, event.target.checked)}/>
                    {column.label}
                </label>
            </div>)}
            <button type="button" className="mt-2 underline" onClick={onReset}>Reset columns</button>
        </div>
    </details>;
}

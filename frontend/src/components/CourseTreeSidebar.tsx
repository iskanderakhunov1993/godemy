"use client";

import { useState } from "react";

// Типы для структуры курса
export type CourseTreeNode = {
  id: string;
  type: "level" | "module" | "topic" | "lesson";
  title: string;
  children?: CourseTreeNode[];
};

interface CourseTreeSidebarProps {
  tree: CourseTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string | null, type: CourseTreeNode["type"]) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onMove: (id: string, newParentId: string | null) => void;
}

export default function CourseTreeSidebar({
  tree,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onEdit,
  onMove,
}: CourseTreeSidebarProps) {
  // drag-and-drop state (упрощённо)
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function renderNode(node: CourseTreeNode, parentId: string | null = null) {
    const isSelected = node.id === selectedId;
    const [hovered, setHovered] = useState(false);
    return (
      <div
        key={node.id}
        className={`group pl-2 border-l-2 border-cyan-900 my-1 rounded-lg transition-colors ${isSelected ? "bg-cyan-950 border-cyan-500" : hovered ? "bg-gray-900/60" : ""}`}
        draggable
        onDragStart={() => setDraggedId(node.id)}
        onDragOver={e => e.preventDefault()}
        onDrop={() => {
          if (draggedId && draggedId !== node.id) onMove(draggedId, node.id);
          setDraggedId(null);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-2 py-1">
          <span
            className={`cursor-pointer font-semibold transition-colors ${isSelected ? "text-cyan-400" : "group-hover:text-cyan-300 text-white"}`}
            onClick={() => onSelect(node.id)}
          >
            {iconForType(node.type)} {node.title}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onAdd(node.id, nextType(node.type))} className="text-xs bg-cyan-800 hover:bg-cyan-700 text-white rounded px-1" title="Добавить">＋</button>
            <button onClick={() => onEdit(node.id)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-1" title="Редактировать">✏️</button>
            <button onClick={() => onDelete(node.id)} className="text-xs bg-red-800 hover:bg-red-700 text-white rounded px-1" title="Удалить">🗑️</button>
            <button onClick={() => onMove(node.id, parentId)} className="text-xs bg-gray-800 hover:bg-cyan-900 text-white rounded px-1" title="Переместить">↕️</button>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-4">
            {node.children.map(child => renderNode(child, node.id))}
          </div>
        )}
      </div>
    );
  }

  function iconForType(type: CourseTreeNode["type"]) {
    if (type === "level") return <span className="mr-1">🏆</span>;
    if (type === "module") return <span className="mr-1">📦</span>;
    if (type === "topic") return <span className="mr-1">📑</span>;
    if (type === "lesson") return <span className="mr-1">📖</span>;
    return null;
  }

  // Определяет следующий тип для добавления (уровень → модуль → тема → урок)
  function nextType(type: CourseTreeNode["type"]): CourseTreeNode["type"] {
    if (type === "level") return "module";
    if (type === "module") return "topic";
    if (type === "topic") return "lesson";
    return "lesson";
  }

  return (
    <aside className="w-80 min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900 border-r border-gray-200 dark:border-cyan-900 p-6 overflow-y-auto shadow-2xl font-sans transition-all">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400 tracking-wide select-none">Структура курса</span>
        <button onClick={() => onAdd(null, "level")}
          className="text-xs bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg px-3 py-1 shadow font-semibold transition-colors">
          ＋ Уровень
        </button>
      </div>
      <div className="space-y-1">
        {tree.length === 0 ? (
          <div className="text-gray-400">Нет уровней</div>
        ) : (
          tree.map(node => renderNode(node, null))
        )}
      </div>
    </aside>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

export type AnnotationTool = 'select' | 'highlight' | 'note' | 'rectangle' | 'arrow';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple';

interface AnnotationToolbarProps {
    activeTool: AnnotationTool;
    onToolChange: (tool: AnnotationTool) => void;
    highlightColor: HighlightColor;
    onColorChange: (color: HighlightColor) => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
}

const tools: { id: AnnotationTool; icon: any; label: string }[] = [
    { id: 'select', icon: Icons.MousePointer, label: 'Select' },
    { id: 'highlight', icon: Icons.Highlighter, label: 'Highlight' },
    { id: 'note', icon: Icons.StickyNote, label: 'Note' },
    { id: 'rectangle', icon: Icons.Square, label: 'Rectangle' },
    { id: 'arrow', icon: Icons.MoveRight, label: 'Arrow' },
];

const colors: { id: HighlightColor; class: string; label: string }[] = [
    { id: 'yellow', class: 'bg-yellow-400', label: 'Yellow' },
    { id: 'green', class: 'bg-green-400', label: 'Green' },
    { id: 'blue', class: 'bg-blue-400', label: 'Blue' },
    { id: 'red', class: 'bg-red-400', label: 'Red' },
    { id: 'purple', class: 'bg-purple-400', label: 'Purple' },
];

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
    activeTool,
    onToolChange,
    highlightColor,
    onColorChange,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
}) => {
    const [showColorPicker, setShowColorPicker] = useState(false);

    return (
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            {/* Tools */}
            <div className="flex items-center gap-1 pr-3 border-r border-slate-200 dark:border-slate-800">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onToolChange(tool.id)}
                        className={`p-2 rounded-lg transition-all ${activeTool === tool.id
                            ? 'bg-primary text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        title={tool.label}
                    >
                        <tool.icon className="w-5 h-5" />
                    </button>
                ))}
            </div>

            {/* Color Picker */}
            {(activeTool === 'highlight' || activeTool === 'rectangle' || activeTool === 'arrow') && (
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className={`w-5 h-5 rounded ${colors.find(c => c.id === highlightColor)?.class} border-2 border-slate-300 dark:border-slate-600`} />
                        <Icons.ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>

                    <AnimatePresence>
                        {showColorPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50"
                            >
                                <div className="flex gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => {
                                                onColorChange(color.id);
                                                setShowColorPicker(false);
                                            }}
                                            className={`w-8 h-8 rounded ${color.class} border-2 ${highlightColor === color.id
                                                ? 'border-slate-900 dark:border-white scale-110'
                                                : 'border-slate-300 dark:border-slate-600'
                                                } transition-all hover:scale-110`}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 pl-3 border-l border-slate-200 dark:border-slate-800 ml-auto">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`p-2 rounded-lg transition-all ${canUndo
                        ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        }`}
                    title="Undo"
                >
                    <Icons.Undo className="w-5 h-5" />
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={`p-2 rounded-lg transition-all ${canRedo
                        ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        }`}
                    title="Redo"
                >
                    <Icons.Redo className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

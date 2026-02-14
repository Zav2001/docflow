import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { addAnnotation, deleteAnnotation } from '../store/annotationsSlice';
import { docApi } from '../../../api/docApi';
import type { Annotation } from '../../../types';
import type { HighlightColor } from './AnnotationToolbar';

interface AnnotationLayerProps {
    documentId: string;
    pageNumber: number;
    activeTool: 'select' | 'highlight' | 'note' | 'rectangle' | 'arrow';
    highlightColor: HighlightColor;
    onAnnotationClick?: (annotation: Annotation) => void;
}

const colorClasses: Record<HighlightColor, { bg: string; border: string; stroke: string }> = {
    yellow: { bg: 'bg-yellow-400/30', border: 'border-yellow-400', stroke: '#facc15' },
    green: { bg: 'bg-green-400/30', border: 'border-green-400', stroke: '#4ade80' },
    blue: { bg: 'bg-blue-400/30', border: 'border-blue-400', stroke: '#60a5fa' },
    red: { bg: 'bg-red-400/30', border: 'border-red-400', stroke: '#f87171' },
    purple: { bg: 'bg-purple-400/30', border: 'border-purple-400', stroke: '#c084fc' },
};

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
    documentId,
    pageNumber,
    activeTool,
    highlightColor,
    onAnnotationClick,
}) => {
    const dispatch = useAppDispatch();
    const annotations = useAppSelector((state) =>
        Object.values(state.annotations.entities).filter(
            (a) => a.documentId === documentId && a.pageNumber === pageNumber
        )
    );

    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
    const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
    const layerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'select') return;

        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setIsSelecting(true);
        setSelectionStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        setSelectionEnd(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || !selectionStart) return;

        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setSelectionEnd({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseUp = () => {
        if (!isSelecting || !selectionStart || !selectionEnd) {
            setIsSelecting(false);
            return;
        }

        const width = Math.abs(selectionEnd.x - selectionStart.x);
        const height = Math.abs(selectionEnd.y - selectionStart.y);
        const x = Math.min(selectionStart.x, selectionEnd.x);
        const y = Math.min(selectionStart.y, selectionEnd.y);

        // Only create annotation if selection is large enough
        if (width > 10 || height > 10) {
            let type: Annotation['type'] = 'HIGHLIGHT';
            let points = undefined;

            if (activeTool === 'highlight') type = 'HIGHLIGHT';
            else if (activeTool === 'note') type = 'COMMENT';
            else if (activeTool === 'rectangle') type = 'RECTANGLE';
            else if (activeTool === 'arrow') {
                type = 'ARROW';
                points = [selectionStart, selectionEnd];
            }

            const newAnnotation: Annotation = {
                id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`,
                documentId,
                pageNumber,
                type,
                position: { x, y, width, height },
                points,
                color: highlightColor,
                authorId: 'current-user',
                createdAt: new Date().toISOString(),
            };
            dispatch(addAnnotation(newAnnotation));
            void docApi.saveAnnotation(newAnnotation);
        }

        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    const handleDeleteAnnotation = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(deleteAnnotation(id));
        void docApi.deleteAnnotation(id);
    };

    const getColors = (colorName?: string) => {
        const color = (colorName as HighlightColor) || 'yellow';
        return colorClasses[color] || colorClasses.yellow;
    };

    const renderAnnotation = (annotation: Annotation) => {
        const colors = getColors(annotation.color);
        const isHovered = hoveredAnnotation === annotation.id;

        // Arrow Rendering
        if (annotation.type === 'ARROW' && annotation.points) {
            const [start, end] = annotation.points;
            const minX = Math.min(start.x, end.x);
            const minY = Math.min(start.y, end.y);
            const width = Math.abs(end.x - start.x);
            const height = Math.abs(end.y - start.y);
            const padding = 10;

            const relStart = { x: start.x - minX, y: start.y - minY };
            const relEnd = { x: end.x - minX, y: end.y - minY };

            return (
                <motion.div
                    key={annotation.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute cursor-pointer pointer-events-auto"
                    style={{
                        left: minX - padding,
                        top: minY - padding,
                        width: width + padding * 2,
                        height: height + padding * 2,
                        zIndex: 10
                    }}
                    onClick={() => onAnnotationClick?.(annotation)}
                    onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                    onMouseLeave={() => setHoveredAnnotation(null)}
                >
                    <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <defs>
                            <marker
                                id={`arrowhead-${annotation.id}`}
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                            >
                                <polygon points="0 0, 10 3.5, 0 7" fill={colors.stroke} />
                            </marker>
                        </defs>
                        <line
                            x1={relStart.x + padding}
                            y1={relStart.y + padding}
                            x2={relEnd.x + padding}
                            y2={relEnd.y + padding}
                            stroke={colors.stroke}
                            strokeWidth="3"
                            markerEnd={`url(#arrowhead-${annotation.id})`}
                        />
                    </svg>
                    {isHovered && renderDeleteButton(annotation.id)}
                </motion.div>
            );
        }

        const style = {
            left: `${annotation.position.x}px`,
            top: `${annotation.position.y}px`,
            width: `${annotation.position.width}px`,
            height: `${annotation.position.height}px`,
        };

        // Rectangle Rendering
        if (annotation.type === 'RECTANGLE') {
            return (
                <motion.div
                    key={annotation.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute border-4 rounded cursor-pointer group ${colors.border}`}
                    style={style}
                    onClick={() => onAnnotationClick?.(annotation)}
                    onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                    onMouseLeave={() => setHoveredAnnotation(null)}
                >
                    {isHovered && renderDeleteButton(annotation.id)}
                </motion.div>
            );
        }

        // Highlight & Comment (Default)
        return (
            <motion.div
                key={annotation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute border-2 rounded cursor-pointer group ${colors.bg} ${colors.border}`}
                style={style}
                onClick={() => onAnnotationClick?.(annotation)}
                onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                onMouseLeave={() => setHoveredAnnotation(null)}
            >
                {isHovered && renderDeleteButton(annotation.id)}
                {isHovered && renderTooltip(annotation)}
            </motion.div>
        );
    };

    const renderDeleteButton = (id: string) => (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => handleDeleteAnnotation(id, e)}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20"
        >
            <Icons.X className="w-4 h-4" />
        </motion.button>
    );

    const renderTooltip = (annotation: Annotation) => (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -top-12 left-0 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none"
        >
            <p className="font-bold">
                {annotation.type === 'COMMENT' ? 'Note' : 'Highlight'}
            </p>
            <p className="text-slate-400 mt-1">
                {new Date(annotation.createdAt).toLocaleDateString()}
            </p>
        </motion.div>
    );

    const renderPreview = () => {
        if (!isSelecting || !selectionStart || !selectionEnd) return null;

        const colors = getColors(highlightColor);
        const width = Math.abs(selectionEnd.x - selectionStart.x);
        const height = Math.abs(selectionEnd.y - selectionStart.y);
        const x = Math.min(selectionStart.x, selectionEnd.x);
        const y = Math.min(selectionStart.y, selectionEnd.y);

        if (activeTool === 'arrow') {
            const padding = 10;
            const relStart = { x: selectionStart.x - x, y: selectionStart.y - y };
            const relEnd = { x: selectionEnd.x - x, y: selectionEnd.y - y };

            return (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        left: x - padding,
                        top: y - padding,
                        width: width + padding * 2,
                        height: height + padding * 2,
                        zIndex: 20
                    }}
                >
                    <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <line
                            x1={relStart.x + padding}
                            y1={relStart.y + padding}
                            x2={relEnd.x + padding}
                            y2={relEnd.y + padding}
                            stroke={colors.stroke}
                            strokeWidth="3"
                        />
                    </svg>
                </div>
            );
        }

        const style = { left: x, top: y, width, height };

        if (activeTool === 'rectangle') {
            return (
                <div
                    className={`absolute border-4 border-dashed ${colors.border} pointer-events-none`}
                    style={style}
                />
            );
        }

        return (
            <div
                className={`absolute border-2 border-dashed ${colors.bg} ${colors.border} pointer-events-none`}
                style={style}
            />
        );
    };

    return (
        <div
            ref={layerRef}
            className="absolute inset-0 z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
                if (isSelecting) handleMouseUp();
            }}
            style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
        >
            {annotations.map(renderAnnotation)}
            {renderPreview()}
        </div>
    );
};

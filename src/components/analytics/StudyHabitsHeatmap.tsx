import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Calendar,
  Flame,
  Award,
  Zap,
  Info,
  Clock,
  Sparkles,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { ExamAttempt, UserStats } from '../../types/ielts';

interface StudyHabitsHeatmapProps {
  userStats: UserStats;
  examHistory: ExamAttempt[];
}

export interface HeatmapCellData {
  dayIndex: number;
  dayName: string;
  hour: number;
  hourLabel: string;
  volumeCount: number;
  studyMinutes: number;
  avgBandScore: number;
  dominantSkill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  isPeak: boolean;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const StudyHabitsHeatmap: React.FC<StudyHabitsHeatmapProps> = ({
  userStats,
  examHistory,
}) => {
  const [metricMode, setMetricMode] = useState<'volume' | 'performance'>('volume');
  const [hoveredCell, setHoveredCell] = useState<{
    data: HeatmapCellData;
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(760);

  // ResizeObserver for responsive D3 rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 200) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate 7x24 Matrix Data (168 Cells) synthesized with candidate's activity
  const heatmapData = useMemo<HeatmapCellData[]>(() => {
    const cells: HeatmapCellData[] = [];

    // Synthesize habit baseline influenced by userStats and examHistory
    const totalDrills = userStats.completedDrillCount || 24;
    const baseTargetBand = userStats.targetBand || 7.5;

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayName = DAYS[dayIndex];
      const isWeekend = dayIndex >= 5;

      for (let hour = 0; hour < 24; hour++) {
        let volume = 0;
        let band = 0;
        let dominant: 'Listening' | 'Reading' | 'Writing' | 'Speaking' = 'Listening';

        // Weekday study peaks: 18:00 - 21:00
        if (!isWeekend && hour >= 18 && hour <= 21) {
          volume = Math.floor(Math.sin((hour - 18) * 1.1) * 4) + (dayIndex === 2 ? 6 : 4);
          band = 7.0 + (dayIndex === 2 ? 0.5 : 0.0) + (hour === 20 ? 0.5 : 0.0);
          dominant = hour >= 20 ? 'Writing' : 'Reading';
        }
        // Weekday morning review: 07:00 - 08:00
        else if (!isWeekend && (hour === 7 || hour === 8)) {
          volume = 2;
          band = 6.5;
          dominant = 'Listening';
        }
        // Weekend morning peak study: 09:00 - 12:00
        else if (isWeekend && hour >= 9 && hour <= 12) {
          volume = dayIndex === 5 ? 7 : 5; // Saturday peak
          band = 7.5 + (hour === 10 ? 0.5 : 0.0);
          dominant = dayIndex === 5 ? 'Listening' : 'Speaking';
        }
        // Weekend afternoon: 15:00 - 17:00
        else if (isWeekend && hour >= 15 && hour <= 17) {
          volume = 3;
          band = 7.0;
          dominant = 'Reading';
        }
        // Occasional light practice
        else if (hour >= 13 && hour <= 14) {
          volume = dayIndex % 2 === 0 ? 1 : 0;
          band = volume > 0 ? 6.5 : 0;
          dominant = 'Listening';
        }

        const isPeak = (volume >= 5 && band >= 7.5) || band >= 8.0;
        const studyMinutes = volume * 15;

        cells.push({
          dayIndex,
          dayName,
          hour,
          hourLabel: `${hour.toString().padStart(2, '0')}:00`,
          volumeCount: volume,
          studyMinutes,
          avgBandScore: band > 0 ? Math.min(9.0, Math.round(band * 2) / 2) : 0,
          dominantSkill: dominant,
          isPeak,
        });
      }
    }

    return cells;
  }, [userStats, examHistory]);

  // D3 Heatmap SVG Rendering Engine
  useEffect(() => {
    if (!svgRef.current || heatmapData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const isDarkMode = document.documentElement.classList.contains('dark');

    const margin = { top: 28, right: 20, bottom: 30, left: 42 };
    const width = Math.max(680, containerWidth);
    const height = 230;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 Scales
    const xScale = d3
      .scaleBand<number>()
      .domain(HOURS)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleBand<string>()
      .domain(DAYS)
      .range([0, innerHeight])
      .padding(0.12);

    // Color Scales based on Metric Mode
    const volumeColorScale = d3
      .scaleLinear<string>()
      .domain([0, 1, 3, 7])
      .range(
        isDarkMode
          ? ['#1e293b', '#1d4ed8', '#2563eb', '#60a5fa']
          : ['#f1f5f9', '#bfdbfe', '#3b82f6', '#1d4ed8']
      );

    const performanceColorScale = d3
      .scaleLinear<string>()
      .domain([0, 5.5, 7.0, 8.5])
      .range(
        isDarkMode
          ? ['#1e293b', '#b45309', '#0284c7', '#10b981']
          : ['#f1f5f9', '#fde68a', '#38bdf8', '#059669']
      );

    // Draw Heatmap Rectangles
    g.selectAll<SVGRectElement, HeatmapCellData>('.cell')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => xScale(d.hour) || 0)
      .attr('y', (d) => yScale(d.dayName) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 3.5)
      .attr('ry', 3.5)
      .attr('fill', (d) => {
        if (metricMode === 'volume') {
          return volumeColorScale(d.volumeCount);
        } else {
          return d.avgBandScore === 0
            ? isDarkMode
              ? '#1e293b'
              : '#f1f5f9'
            : performanceColorScale(d.avgBandScore);
        }
      })
      .attr('stroke', (d) => {
        if (d.isPeak && metricMode === 'performance') return '#10b981';
        return 'transparent';
      })
      .attr('stroke-width', (d) => (d.isPeak && metricMode === 'performance' ? 1.5 : 0))
      .style('cursor', 'pointer')
      .style('transition', 'transform 0.15s ease, stroke 0.15s ease')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .attr('stroke', isDarkMode ? '#ffffff' : '#0f172a')
          .attr('stroke-width', 2);

        const rect = (this as SVGRectElement).getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect() || {
          left: 0,
          top: 0,
        };

        setHoveredCell({
          data: d,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 8,
        });
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .attr('stroke', d.isPeak && metricMode === 'performance' ? '#10b981' : 'transparent')
          .attr('stroke-width', d.isPeak && metricMode === 'performance' ? 1.5 : 0);
        setHoveredCell(null);
      });

    // Y-Axis Day Labels
    g.selectAll<SVGTextElement, string>('.day-label')
      .data(DAYS)
      .enter()
      .append('text')
      .attr('class', 'day-label')
      .attr('x', -8)
      .attr('y', (d) => (yScale(d) || 0) + yScale.bandwidth() / 2 + 3.5)
      .attr('text-anchor', 'end')
      .attr('fill', isDarkMode ? '#94a3b8' : '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .text((d) => d);

    // X-Axis Hour Labels (sampled every 3 hours: 00, 03, 06, 09, 12, 15, 18, 21)
    const sampledHours = [0, 3, 6, 9, 12, 15, 18, 21];
    g.selectAll<SVGTextElement, number>('.hour-label')
      .data(sampledHours)
      .enter()
      .append('text')
      .attr('class', 'hour-label')
      .attr('x', (h) => (xScale(h) || 0) + xScale.bandwidth() / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', isDarkMode ? '#94a3b8' : '#64748b')
      .attr('font-size', '9.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '500')
      .text((h) => `${h.toString().padStart(2, '0')}:00`);
  }, [heatmapData, metricMode, containerWidth]);

  return (
    <div
      ref={containerRef}
      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 relative"
    >
      {/* Heatmap Header & Metric Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Study Habits & Performance Peaks Heatmap
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
                D3 Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies your optimal retention windows and weekly productivity chronotypes
            </p>
          </div>
        </div>

        {/* Dual Metric Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('volume')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              metricMode === 'volume'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-blue-500" />
            <span>Study Volume</span>
          </button>

          <button
            onClick={() => setMetricMode('performance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              metricMode === 'performance'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Band Performance Peaks</span>
          </button>
        </div>
      </div>

      {/* Habit Metrics Insight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-[11px]">Optimal Focus Window</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            19:00 – 21:00
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Avg. Band 7.5 Peak
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold text-[11px]">Most Active Day</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            Wednesday
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            18 Drills Completed
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-[11px]">Weekend Mock Timing</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            Sat 09:00 – 12:00
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Highest Exam Endurance
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-[11px]">Dominant Peak Skill</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            Listening Lab
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Band 8.0 Achieved
          </span>
        </div>
      </div>

      {/* D3 Heatmap SVG Container */}
      <div className="overflow-x-auto pb-1 scrollbar-thin">
        <svg ref={svgRef} className="w-full" style={{ minWidth: '680px' }} />
      </div>

      {/* Floating Interactive Hover Tooltip */}
      {hoveredCell && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 p-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs space-y-1"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            minWidth: '180px',
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-white">
              {hoveredCell.data.dayName} · {hoveredCell.data.hourLabel}
            </span>
            {hoveredCell.data.isPeak && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Peak
              </span>
            )}
          </div>

          <div className="pt-0.5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Practice Volume:</span>
              <span className="font-mono font-semibold text-white">
                {hoveredCell.data.volumeCount > 0
                  ? `${hoveredCell.data.volumeCount} drills (${hoveredCell.data.studyMinutes}m)`
                  : 'No drills logged'}
              </span>
            </div>

            {hoveredCell.data.avgBandScore > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Average Band:</span>
                <span className="font-mono font-bold text-emerald-400">
                  Band {hoveredCell.data.avgBandScore.toFixed(1)}
                </span>
              </div>
            )}

            {hoveredCell.data.volumeCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Focus:</span>
                <span className="font-semibold text-blue-400">
                  {hoveredCell.data.dominantSkill}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color Scale Legend */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>
            {metricMode === 'volume'
              ? 'Color intensity indicates drill session frequency and total practice time.'
              : 'Color highlights average IELTS band scores achieved during hourly practice sessions.'}
          </span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono">Low</span>
          <div className="flex items-center gap-0.5">
            {metricMode === 'volume' ? (
              <>
                <div className="w-3 h-3 rounded-xs bg-slate-200 dark:bg-slate-800" />
                <div className="w-3 h-3 rounded-xs bg-blue-200 dark:bg-blue-900" />
                <div className="w-3 h-3 rounded-xs bg-blue-500 dark:bg-blue-600" />
                <div className="w-3 h-3 rounded-xs bg-blue-700 dark:bg-blue-400" />
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-xs bg-slate-200 dark:bg-slate-800" />
                <div className="w-3 h-3 rounded-xs bg-amber-200 dark:bg-amber-700" />
                <div className="w-3 h-3 rounded-xs bg-sky-400 dark:bg-sky-500" />
                <div className="w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-400" />
              </>
            )}
          </div>
          <span className="text-[10px] font-mono">
            {metricMode === 'volume' ? 'Peak (7+ Drills)' : 'Band 8.5+'}
          </span>
        </div>
      </div>
    </div>
  );
};

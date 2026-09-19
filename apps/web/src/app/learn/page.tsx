"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  ArrowRight,
  Flame,
  FileCheck2,
  MessageSquare
} from "lucide-react";

export default function DailyLearningPage() {
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const todayTasks = [
    {
      id: 1,
      title: "Interactive Study: Pandas Missing Data Handling",
      type: "Lesson",
      duration: "25 min",
      description: "Review when to impute with median vs forward fill (ffill) across skewed e-commerce datasets.",
      link: "/tutor?topic=Pandas%20Missing%20Data"
    },
    {
      id: 2,
      title: "Active Practice: 5 SQL & Imputation Questions",
      type: "Practice",
      duration: "15 min",
      description: "Hands-on exercises targeting boolean masking and .fillna() parameters.",
      link: "/practice"
    },
    {
      id: 3,
      title: "Applied Data Cleaning Sandbox Task",
      type: "Applied Code",
      duration: "30 min",
      description: "Clean the shipping_cost column in raw retail transaction orders.",
      link: "/practice"
    },
    {
      id: 4,
      title: "Daily Checkpoint Assessment",
      type: "Checkpoint",
      duration: "15 min",
      description: "Prove competency to update evidence ledger and trigger topological DAG unlocking.",
      link: "/assessment?skill=pandas_data_cleaning&node=node_pandas_cleaning&title=Pandas%20Data%20Cleaning"
    }
  ];

  const toggleTask = (id: number) => {
    if (completedTasks.includes(id)) {
      setCompletedTasks(completedTasks.filter((t) => t !== id));
    } else {
      setCompletedTasks([...completedTasks, id]);
    }
  };

  const progressPct = Math.round((completedTasks.length / todayTasks.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/40 via-[#0d1424] to-[#0a101d] p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
              Daily Sprint Mode
            </span>
            <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
              <Flame className="h-4 w-4 fill-amber-400" /> 4-Day Streak
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: 85 Minutes</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white">Today's Adaptive Learning Plan</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Curated automatically by your Roadmap Planner. Completing these 4 activities satisfies today's prerequisite milestones.
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-slate-300 font-semibold">
            <span>Daily Completion</span>
            <span>{progressPct}% Completed</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {todayTasks.map((task, idx) => {
          const isDone = completedTasks.includes(task.id);
          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isDone
                  ? "border-emerald-500/40 bg-emerald-950/15"
                  : "border-white/10 bg-[#0d1424] hover:border-indigo-500/40"
              }`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
                    isDone
                      ? "border-emerald-400 bg-emerald-500 text-white shadow"
                      : "border-slate-600 bg-black/40 text-transparent hover:border-slate-400"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </button>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {task.type}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="h-3 w-3" /> {task.duration}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold text-white mt-0.5 ${isDone ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {task.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 sm:self-center">
                <Link
                  href={task.link}
                  className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Start</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

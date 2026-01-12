
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  Plus,
  Trash2,
  Clock,
  Edit3,
  Save,
  CheckCircle2,
  ListTodo,
  History,
  BrainCircuit,
  Settings,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Job, Skill, ScheduleItem, CareerGoals, JobStatus, SkillStatus, ScheduleType } from './types';
import { analyzeJD, JDAnalysisResult } from './services/geminiService';

// --- Components ---

const Sidebar: React.FC<{ 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  progress: number;
}> = ({ activeTab, setActiveTab, progress }) => {
  const menuItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
    { id: 'planner', icon: Calendar, label: 'Sprint Planner' },
    { id: 'skills', icon: BookOpen, label: 'Skill Bank' },
    { id: 'jobs', icon: Briefcase, label: 'Applications' }
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col border-r border-slate-800 z-50">
      <div className="flex items-center gap-3 mb-10 text-blue-400">
        <div className="bg-blue-600/20 p-2 rounded-lg">
          <Target size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">Sprint Career</span>
      </div>
      
      <div className="space-y-1.5 flex-1">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:text-blue-400'} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 mb-3 font-bold uppercase tracking-widest flex justify-between">
            Sprint Progress <span>{Math.round(progress)}%</span>
          </p>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardName, setDashboardName] = useState('My Job Sprint');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdInput, setJdInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<JDAnalysisResult | null>(null);

  const goals: CareerGoals = { applications: 30, interviews: 10, offers: 2 };

  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'PowerBI', status: 'Learning', source: 'JD Analysis' },
    { id: '2', name: 'React & TS', status: 'Mastered', source: 'Self' },
    { id: '3', name: 'Product Design', status: 'To Do', source: 'Goal' }
  ]);

  const [jobs, setJobs] = useState<Job[]>([
    { id: 'j1', company: 'NVIDIA', title: 'Frontend Engineer', status: 'Interviewing', date: '2024-01-12', url: 'https://nvidia.com/careers' },
    { id: 'j2', company: 'Google', title: 'UX Developer', status: 'Applied', date: '2024-01-10', url: 'https://google.com/about/careers' },
    { id: 'j3', company: 'Stripe', title: 'Fullstack Dev', status: 'ToApply', date: '2024-01-13' },
    { id: 'j4', company: 'Apple', title: 'Product Manager', status: 'Rejected', date: '2024-01-05' }
  ]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 's1', time: '09:00 - 10:30', task: 'Market Scan', desc: 'Scan LinkedIn for 10 new relevant openings', type: 'daily' },
    { id: 's2', time: '11:00 - 13:00', task: 'Deep Application', desc: 'Customize resume for 2 high-priority JDs', type: 'daily' },
    { id: 's3', time: 'Sat 10:00', task: 'Mock Interview', desc: 'Practice behavioral questions for 1 hour', type: 'weekly' },
  ]);

  const stats = useMemo(() => {
    const applied = jobs.filter(j => j.status !== 'ToApply').length;
    const interviews = jobs.filter(j => ['Interviewing', 'Offered', 'Rejected'].includes(j.status)).length;
    const offers = jobs.filter(j => j.status === 'Offered').length;
    return { applied, interviews, offers };
  }, [jobs]);

  const chartData = [
    { name: 'Applied', value: stats.applied, goal: goals.applications, color: '#3b82f6' },
    { name: 'Interview', value: stats.interviews, goal: goals.interviews, color: '#10b981' },
    { name: 'Offers', value: stats.offers, goal: goals.offers, color: '#f59e0b' },
  ];

  const handleJDAnalysis = async () => {
    if (!jdInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeJD(jdInput);
      setAnalysisResult(result);
      
      const newSkills: Skill[] = result.skills.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        status: 'To Do' as SkillStatus,
        source: 'AI Analysis'
      })).filter(ns => !skills.some(os => os.name.toLowerCase() === ns.name.toLowerCase()));
      
      if (newSkills.length > 0) {
        setSkills(prev => [...prev, ...newSkills]);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze JD. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
      setJdInput('');
    }
  };

  const updateJobStatus = (id: string, newStatus: JobStatus) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  const deleteJob = (id: string) => {
    if (confirm("Delete this entry?")) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const addJob = () => {
    const company = prompt("Company Name?");
    const title = prompt("Job Title?");
    const url = prompt("Job Posting URL? (Optional)") || undefined;
    if (company && title) {
      setJobs([{ 
        id: Date.now().toString(), 
        company, 
        title, 
        status: 'ToApply' as JobStatus, 
        date: new Date().toISOString().split('T')[0],
        url
      }, ...jobs]);
    }
  };

  const sortedSchedule = useMemo(() => {
    return [...schedule].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'daily' ? -1 : 1;
      return a.time.localeCompare(b.time);
    });
  }, [schedule]);

  const progressPercentage = (stats.applied / goals.applications) * 100;

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} progress={progressPercentage} />

      <main className="flex-1 md:ml-64 p-4 md:p-10 max-w-6xl mx-auto w-full transition-all duration-300">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <input 
                  autoFocus
                  className="text-3xl font-black text-slate-900 bg-transparent border-b-4 border-blue-500 outline-none"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                />
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{dashboardName}</h1>
                  <Edit3 size={20} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
              <Clock size={16} /> 2 Weeks remaining in current sprint
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Sprint End</span>
              <span className="text-xl font-black text-slate-900">May 31</span>
            </div>
            <div className="h-8 w-[2px] bg-slate-100 mx-1"></div>
            <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition text-slate-600">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Applications', value: stats.applied, goal: goals.applications, icon: ListTodo, color: 'blue' },
                { label: 'Interviews', value: stats.interviews, goal: goals.interviews, icon: Target, color: 'emerald' },
                { label: 'Offers', value: stats.offers, goal: goals.offers, icon: ChevronRight, color: 'amber' },
              ].map((item) => (
                <div key={item.label} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-2xl`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{item.value}</span>
                    <span className="text-slate-300 font-bold">/ {item.goal}</span>
                  </div>
                  <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`bg-${item.color}-500 h-full transition-all duration-1000`} 
                      style={{ width: `${Math.min((item.value / item.goal) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Analyzer & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Job Analyzer</h2>
                    <p className="text-sm text-slate-400">Instantly map skills from any job description</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea 
                    value={jdInput}
                    onChange={(e) => setJdInput(e.target.value)}
                    className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none custom-scrollbar"
                    placeholder="Paste a JD text here (e.g., from LinkedIn or Indeed)..."
                  ></textarea>
                  
                  <button 
                    onClick={handleJDAnalysis}
                    disabled={isAnalyzing || !jdInput.trim()}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Analyzing Opportunity...
                      </>
                    ) : (
                      <>Analyze & Sync Skills</>
                    )}
                  </button>

                  {analysisResult && (
                    <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 animate-fade-in">
                      <h3 className="text-blue-700 font-bold mb-2 flex items-center gap-2">
                        <Target size={18} /> Strategic Advice
                      </h3>
                      <p className="text-blue-800/80 italic text-sm mb-4 leading-relaxed">
                        &quot;{analysisResult.strategy}&quot;
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.skills.map(skill => (
                          <span key={skill} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 border border-blue-200 shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Visual Progress</h2>
                <div className="flex-1 min-h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase">Conversion Rate</span>
                    <span className="text-blue-600">{Math.round((stats.interviews/stats.applied) * 100) || 0}% App-to-Int</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <header className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sprint Planner</h2>
                <p className="text-slate-500 font-medium">Systematic daily and weekly routines to maximize ROI.</p>
              </div>
              <button 
                onClick={() => alert("Add task functionality is mock in this view.")}
                className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                <Plus size={24} />
              </button>
            </header>

            <div className="space-y-4">
              {sortedSchedule.map((item) => (
                <div key={item.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-32 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${
                        item.type === 'daily' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.type}
                      </span>
                      <div className="text-xl font-black text-slate-900 font-mono tracking-tighter">{item.time}</div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100"></div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.task}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 text-slate-400 hover:text-blue-500 transition"><Edit3 size={18} /></button>
                       <button className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="animate-fade-in max-w-5xl">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Skill Bank</h2>
                <p className="text-slate-500 font-medium">Manage your technical arsenal and bridge the gap.</p>
              </div>
              <button 
                onClick={() => {
                  const name = prompt("Skill name?");
                  if(name) setSkills([...skills, { id: Date.now().toString(), name, status: 'To Do' as SkillStatus, source: 'Manual' }]);
                }}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} /> Add Skill
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map(skill => (
                <div key={skill.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-900">{skill.name}</h3>
                    <button onClick={() => setSkills(skills.filter(s => s.id !== skill.id))} className="text-slate-200 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{skill.source}</span>
                    <select 
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase outline-none transition-all cursor-pointer ${
                        skill.status === 'Mastered' ? 'bg-emerald-100 text-emerald-700' :
                        skill.status === 'Learning' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}
                      value={skill.status}
                      onChange={(e) => setSkills(skills.map(s => s.id === skill.id ? {...s, status: e.target.value as SkillStatus} : s))}
                    >
                      <option value="To Do">To Do</option>
                      <option value="Learning">Learning</option>
                      <option value="Mastered">Mastered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="animate-fade-in space-y-10">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Tracker</h2>
                <p className="text-slate-500 font-medium">Keep your funnel organized from lead to offer.</p>
              </div>
              <button 
                onClick={addJob}
                className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-blue-700 transition flex items-center gap-3 shadow-xl shadow-blue-200"
              >
                <Plus size={22} /> New Target
              </button>
            </header>

            {/* Backlog Section */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-400">
                <div className="p-2 bg-slate-100 rounded-lg"><ListTodo size={18} /></div>
                <h3 className="font-black uppercase tracking-widest text-xs">Backlog (Ready to apply)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.filter(j => j.status === 'ToApply').map(job => (
                  <div key={job.id} className="bg-white/50 p-6 rounded-[2rem] border border-dashed border-slate-200 flex justify-between items-center group hover:bg-white hover:border-blue-200 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 border border-slate-100">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 leading-none mb-1">{job.company}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400 font-medium">{job.title}</p>
                          {job.url && (
                            <a 
                              href={job.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 transition"
                              title="View Posting"
                            >
                              <LinkIcon size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold shadow-sm outline-none hover:ring-2 hover:ring-blue-100 transition-all"
                        value={job.status}
                        onChange={(e) => updateJobStatus(job.id, e.target.value as JobStatus)}
                      >
                        <option value="ToApply">To Apply</option>
                        <option value="Applied">Just Applied</option>
                      </select>
                      <button onClick={() => deleteJob(job.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {jobs.filter(j => j.status === 'ToApply').length === 0 && (
                  <div className="col-span-full py-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-medium italic">
                    Queue is empty. Find some leads!
                  </div>
                )}
              </div>
            </section>

            {/* Active Pipeline Section */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-800">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><History size={18} /></div>
                <h3 className="font-black uppercase tracking-widest text-xs">Active Funnel</h3>
              </div>
              <div className="space-y-4">
                {jobs.filter(j => j.status !== 'ToApply').map(job => (
                  <div key={job.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-wrap gap-4 justify-between items-center group hover:shadow-xl hover:border-blue-50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center font-black text-xl shadow-lg shadow-slate-200">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-slate-900">{job.company}</h4>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                            <span>{job.title}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{job.date}</span>
                          </div>
                          {job.url && (
                            <a 
                              href={job.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-500 font-bold hover:text-blue-700 transition w-fit group/link"
                            >
                              <LinkIcon size={12} />
                              <span>View Application Link</span>
                              <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <select 
                        className={`min-w-[140px] border-none rounded-2xl px-5 py-3 text-sm font-black shadow-inner cursor-pointer transition-all ${
                          job.status === 'Offered' ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' :
                          job.status === 'Interviewing' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' :
                          job.status === 'Rejected' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200'
                        }`}
                        value={job.status}
                        onChange={(e) => updateJobStatus(job.id, e.target.value as JobStatus)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offer Received</option>
                        <option value="Rejected">Not Selected</option>
                      </select>
                      <button onClick={() => deleteJob(job.id)} className="text-slate-200 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><TrendingUp size={24} /></button>
        <button onClick={() => setActiveTab('planner')} className={`p-2 ${activeTab === 'planner' ? 'text-blue-600' : 'text-slate-400'}`}><Calendar size={24} /></button>
        <button onClick={() => setActiveTab('skills')} className={`p-2 ${activeTab === 'skills' ? 'text-blue-600' : 'text-slate-400'}`}><BookOpen size={24} /></button>
        <button onClick={() => setActiveTab('jobs')} className={`p-2 ${activeTab === 'jobs' ? 'text-blue-600' : 'text-slate-400'}`}><Briefcase size={24} /></button>
      </div>
    </div>
  );
};

export default App;

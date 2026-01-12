
export type SkillStatus = 'To Do' | 'Learning' | 'Mastered';

export interface Skill {
  id: string;
  name: string;
  status: SkillStatus;
  source: string;
}

export type JobStatus = 'ToApply' | 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';

export interface Job {
  id: string;
  company: string;
  title: string;
  status: JobStatus;
  date: string;
  url?: string;
}

export type ScheduleType = 'daily' | 'weekly';

export interface ScheduleItem {
  id: string;
  time: string;
  task: string;
  desc: string;
  type: ScheduleType;
}

export interface CareerGoals {
  applications: number;
  interviews: number;
  offers: number;
}

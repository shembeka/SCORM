export interface ScormData {
  'cmi.core.lesson_location': string;
  'cmi.core.lesson_status': 'passed' | 'completed' | 'failed' | 'incomplete' | 'browsed' | 'not attempted';
  'cmi.core.score.raw': string;
  'cmi.core.score.max': string;
  'cmi.core.score.min': string;
  'cmi.core.session_time': string;
  'cmi.core.total_time': string;
  'cmi.core.exit': 'time-out' | 'suspend' | 'logout' | '';
  'cmi.core.credit': 'credit' | 'no-credit';
  'cmi.core.entry': 'ab-initio' | 'resume' | '';
  'cmi.suspend_data': string;
  'cmi.launch_data': string;
  'cmi.comments': string;
  'cmi.comments_from_lms': string;
  'cmi.core.student_id': string;
  'cmi.core.student_name': string;
  'cmi.student_data.mastery_score': string;
  'cmi.student_data.max_time_allowed': string;
  'cmi.student_data.time_limit_action': 'exit,message' | 'exit,no message' | 'continue,message' | 'continue,no message';
}

export interface ScormPackage {
  id: string;
  name: string;
  version: string;
  uploadDate: Date;
  manifestUrl: string;
  launchUrl: string;
  data: Partial<ScormData>;
  events: ScormEvent[];
}

export interface ScormEvent {
  id: string;
  timestamp: Date;
  type: 'initialize' | 'getValue' | 'setValue' | 'commit' | 'terminate' | 'getErrorString' | 'getDiagnostic';
  element?: string;
  value?: string;
  success: boolean;
  errorCode: string;
}

export type ScormApiError = 
  | '0'    // No Error
  | '101'  // General Exception
  | '201'  // Invalid argument error
  | '202'  // Element cannot have children
  | '203'  // Element not an array - cannot have count
  | '301'  // Not initialized
  | '401'  // Not implemented error
  | '402'  // Invalid set value, element is a keyword
  | '403'  // Element is read only
  | '404'  // Element is write only
  | '405'; // Incorrect Data Type
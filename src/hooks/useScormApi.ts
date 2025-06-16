import { useCallback, useRef, useState } from 'react';
import { ScormData, ScormEvent, ScormApiError, ScormPackage } from '../types/scorm';

export const useScormApi = () => {
  const [currentPackage, setCurrentPackage] = useState<ScormPackage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [events, setEvents] = useState<ScormEvent[]>([]);
  const scormDataRef = useRef<Partial<ScormData>>({});
  const errorCodeRef = useRef<ScormApiError>('0');

  const addEvent = useCallback((event: Omit<ScormEvent, 'id' | 'timestamp'>) => {
    const newEvent: ScormEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const scormApi = useCallback(() => {
    const api = {
      LMSInitialize: (parameter: string): string => {
        console.log('SCORM API: LMSInitialize called', parameter);
        if (parameter !== '') {
          errorCodeRef.current = '201';
          addEvent({ type: 'initialize', success: false, errorCode: '201' });
          return 'false';
        }
        
        if (isInitialized) {
          errorCodeRef.current = '101';
          addEvent({ type: 'initialize', success: false, errorCode: '101' });
          return 'false';
        }

        setIsInitialized(true);
        errorCodeRef.current = '0';
        
        // Initialize default values
        scormDataRef.current = {
          'cmi.core.lesson_status': 'not attempted',
          'cmi.core.lesson_location': '',
          'cmi.core.score.raw': '',
          'cmi.core.score.max': '100',
          'cmi.core.score.min': '0',
          'cmi.core.session_time': '00:00:00',
          'cmi.core.total_time': '00:00:00',
          'cmi.core.exit': '',
          'cmi.core.credit': 'credit',
          'cmi.core.entry': 'ab-initio',
          'cmi.suspend_data': '',
          'cmi.launch_data': '',
          'cmi.comments': '',
          'cmi.comments_from_lms': '',
          'cmi.core.student_id': 'student_001',
          'cmi.core.student_name': 'John Doe',
          'cmi.student_data.mastery_score': '80',
          'cmi.student_data.max_time_allowed': '',
          'cmi.student_data.time_limit_action': 'continue,no message',
          ...currentPackage?.data
        };

        addEvent({ type: 'initialize', success: true, errorCode: '0' });
        return 'true';
      },

      LMSFinish: (parameter: string): string => {
        console.log('SCORM API: LMSFinish called', parameter);
        if (parameter !== '') {
          errorCodeRef.current = '201';
          addEvent({ type: 'terminate', success: false, errorCode: '201' });
          return 'false';
        }
        
        if (!isInitialized) {
          errorCodeRef.current = '301';
          addEvent({ type: 'terminate', success: false, errorCode: '301' });
          return 'false';
        }

        setIsInitialized(false);
        errorCodeRef.current = '0';
        addEvent({ type: 'terminate', success: true, errorCode: '0' });
        return 'true';
      },

      LMSGetValue: (element: string): string => {
        console.log('SCORM API: LMSGetValue called', element);
        if (!isInitialized) {
          errorCodeRef.current = '301';
          addEvent({ type: 'getValue', element, success: false, errorCode: '301' });
          return '';
        }

        const value = scormDataRef.current[element as keyof ScormData] || '';
        errorCodeRef.current = '0';
        addEvent({ type: 'getValue', element, value: value.toString(), success: true, errorCode: '0' });
        return value.toString();
      },

      LMSSetValue: (element: string, value: string): string => {
        console.log('SCORM API: LMSSetValue called', element, value);
        if (!isInitialized) {
          errorCodeRef.current = '301';
          addEvent({ type: 'setValue', element, value, success: false, errorCode: '301' });
          return 'false';
        }

        // Read-only elements check
        const readOnlyElements = [
          'cmi.core.credit',
          'cmi.core.entry',
          'cmi.core.student_id',
          'cmi.core.student_name',
          'cmi.student_data.mastery_score',
          'cmi.student_data.max_time_allowed',
          'cmi.student_data.time_limit_action',
          'cmi.launch_data',
          'cmi.comments_from_lms'
        ];

        if (readOnlyElements.includes(element)) {
          errorCodeRef.current = '403';
          addEvent({ type: 'setValue', element, value, success: false, errorCode: '403' });
          return 'false';
        }

        scormDataRef.current[element as keyof ScormData] = value as any;
        errorCodeRef.current = '0';
        addEvent({ type: 'setValue', element, value, success: true, errorCode: '0' });
        
        // Update package data if we have one
        if (currentPackage) {
          setCurrentPackage(prev => prev ? {
            ...prev,
            data: { ...prev.data, [element]: value }
          } : null);
        }
        
        return 'true';
      },

      LMSCommit: (parameter: string): string => {
        console.log('SCORM API: LMSCommit called', parameter);
        if (parameter !== '') {
          errorCodeRef.current = '201';
          addEvent({ type: 'commit', success: false, errorCode: '201' });
          return 'false';
        }
        
        if (!isInitialized) {
          errorCodeRef.current = '301';
          addEvent({ type: 'commit', success: false, errorCode: '301' });
          return 'false';
        }

        errorCodeRef.current = '0';
        addEvent({ type: 'commit', success: true, errorCode: '0' });
        return 'true';
      },

      LMSGetLastError: (): string => {
        return errorCodeRef.current;
      },

      LMSGetErrorString: (errorCode: string): string => {
        const errorMessages: Record<string, string> = {
          '0': 'No Error',
          '101': 'General Exception',
          '201': 'Invalid argument error',
          '202': 'Element cannot have children',
          '203': 'Element not an array - cannot have count',
          '301': 'Not initialized',
          '401': 'Not implemented error',
          '402': 'Invalid set value, element is a keyword',
          '403': 'Element is read only',
          '404': 'Element is write only',
          '405': 'Incorrect Data Type'
        };
        
        const message = errorMessages[errorCode] || 'Unknown Error';
        addEvent({ type: 'getErrorString', value: message, success: true, errorCode: '0' });
        return message;
      },

      LMSGetDiagnostic: (errorCode: string): string => {
        const diagnostic = `Diagnostic information for error ${errorCode}`;
        addEvent({ type: 'getDiagnostic', value: diagnostic, success: true, errorCode: '0' });
        return diagnostic;
      }
    };

    return api;
  }, [isInitialized, currentPackage, addEvent]);

  const getProgress = useCallback(() => {
    const status = scormDataRef.current['cmi.core.lesson_status'] || 'not attempted';
    const score = parseFloat(scormDataRef.current['cmi.core.score.raw'] || '0');
    const maxScore = parseFloat(scormDataRef.current['cmi.core.score.max'] || '100');
    const location = scormDataRef.current['cmi.core.lesson_location'] || '';
    
    return {
      status,
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      location,
      sessionTime: scormDataRef.current['cmi.core.session_time'] || '00:00:00',
      totalTime: scormDataRef.current['cmi.core.total_time'] || '00:00:00'
    };
  }, []);

  return {
    scormApi,
    currentPackage,
    setCurrentPackage,
    isInitialized,
    events,
    getProgress,
    scormData: scormDataRef.current
  };
};
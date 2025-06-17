import { useCallback, useRef, useState } from 'react';
import { ScormData, ScormEvent, ScormApiError, ScormPackage } from '../types/scorm';

export const useScormApi = () => {
  const [currentPackage, setCurrentPackage] = useState<ScormPackage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [events, setEvents] = useState<ScormEvent[]>([]);
  const scormDataRef = useRef<Record<string, string>>({});
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

  // Valid SCORM 1.2 data model elements
  const validElements = new Set([
    'cmi.core.lesson_location',
    'cmi.core.lesson_status',
    'cmi.core.score.raw',
    'cmi.core.score.max',
    'cmi.core.score.min',
    'cmi.core.session_time',
    'cmi.core.total_time',
    'cmi.core.exit',
    'cmi.core.credit',
    'cmi.core.entry',
    'cmi.suspend_data',
    'cmi.launch_data',
    'cmi.comments',
    'cmi.comments_from_lms',
    'cmi.core.student_id',
    'cmi.core.student_name',
    'cmi.student_data.mastery_score',
    'cmi.student_data.max_time_allowed',
    'cmi.student_data.time_limit_action'
  ]);

  // Read-only elements
  const readOnlyElements = new Set([
    'cmi.core.credit',
    'cmi.core.entry',
    'cmi.core.student_id',
    'cmi.core.student_name',
    'cmi.student_data.mastery_score',
    'cmi.student_data.max_time_allowed',
    'cmi.student_data.time_limit_action',
    'cmi.launch_data',
    'cmi.comments_from_lms'
  ]);

  const validateElement = (element: string): boolean => {
    return validElements.has(element);
  };

  const validateValue = (element: string, value: string): boolean => {
    switch (element) {
      case 'cmi.core.lesson_status':
        return ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'].includes(value);
      case 'cmi.core.exit':
        return ['time-out', 'suspend', 'logout', ''].includes(value);
      case 'cmi.core.credit':
        return ['credit', 'no-credit'].includes(value);
      case 'cmi.core.entry':
        return ['ab-initio', 'resume', ''].includes(value);
      case 'cmi.student_data.time_limit_action':
        return ['exit,message', 'exit,no message', 'continue,message', 'continue,no message'].includes(value);
      case 'cmi.core.score.raw':
      case 'cmi.core.score.max':
      case 'cmi.core.score.min':
        return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
      default:
        return true; // Allow other values
    }
  };

  const scormApi = useCallback(() => {
    const api = {
      LMSInitialize: (parameter: string): string => {
        console.log('✅ SCORM API: LMSInitialize called with parameter:', parameter);
        if (parameter !== '') {
          errorCodeRef.current = '201';
          console.error('❌ SCORM Error: Invalid parameter for LMSInitialize');
          addEvent({ type: 'initialize', success: false, errorCode: '201' });
          return 'false';
        }
        
        if (isInitialized) {
          errorCodeRef.current = '101';
          console.error('❌ SCORM Error: Already initialized');
          addEvent({ type: 'initialize', success: false, errorCode: '101' });
          return 'false';
        }

        setIsInitialized(true);
        errorCodeRef.current = '0';
        
        // Initialize default values with proper SCORM 1.2 data model
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
          'cmi.student_data.time_limit_action': 'continue,no message'
        };

        // Merge with current package data if available
        if (currentPackage?.data) {
          Object.keys(currentPackage.data).forEach(key => {
            if (validElements.has(key) && currentPackage.data[key as keyof ScormData]) {
              scormDataRef.current[key] = String(currentPackage.data[key as keyof ScormData]);
            }
          });
        }

        console.log('✅ SCORM API: Successfully initialized');
        addEvent({ type: 'initialize', success: true, errorCode: '0' });
        return 'true';
      },

      LMSFinish: (parameter: string): string => {
        console.log('✅ SCORM API: LMSFinish called with parameter:', parameter);
        if (parameter !== '') {
          errorCodeRef.current = '201';
          console.error('❌ SCORM Error: Invalid parameter for LMSFinish');
          addEvent({ type: 'terminate', success: false, errorCode: '201' });
          return 'false';
        }
        
        if (!isInitialized) {
          errorCodeRef.current = '301';
          console.error('❌ SCORM Error: Not initialized');
          addEvent({ type: 'terminate', success: false, errorCode: '301' });
          return 'false';
        }

        setIsInitialized(false);
        errorCodeRef.current = '0';
        console.log('✅ SCORM API: Successfully terminated');
        addEvent({ type: 'terminate', success: true, errorCode: '0' });
        return 'true';
      },

      LMSGetValue: (element: string): string => {
        console.log('📖 SCORM API: LMSGetValue called for element:', element);
        if (!isInitialized) {
          errorCodeRef.current = '301';
          console.error('❌ SCORM Error: Not initialized');
          addEvent({ type: 'getValue', element, success: false, errorCode: '301' });
          return '';
        }

        if (!validateElement(element)) {
          errorCodeRef.current = '201';
          console.error('❌ SCORM Error: Invalid element:', element);
          addEvent({ type: 'getValue', element, success: false, errorCode: '201' });
          return '';
        }

        const value = scormDataRef.current[element] || '';
        errorCodeRef.current = '0';
        console.log('✅ SCORM API: Retrieved value for', element, '=', value);
        addEvent({ type: 'getValue', element, value, success: true, errorCode: '0' });
        return value;
      },

      LMSSetValue: (element: string, value: string): string => {
        console.log('💾 SCORM API: LMSSetValue called -', element, '=', value);
        if (!isInitialized) {
          errorCodeRef.current = '301';
          console.error('❌ SCORM Error: Not initialized');
          addEvent({ type: 'setValue', element, value, success: false, errorCode: '301' });
          return 'false';
        }

        if (!validateElement(element)) {
          errorCodeRef.current = '201';
          console.error('❌ SCORM Error: Invalid element:', element);
          addEvent({ type: 'setValue', element, value, success: false, errorCode: '201' });
          return 'false';
        }

        if (readOnlyElements.has(element)) {
          errorCodeRef.current = '403';
          console.error('❌ SCORM Error: Element is read-only:', element);
          addEvent({ type: 'setValue', element, value, success: false, errorCode: '403' });
          return 'false';
        }

        if (!validateValue(element, value)) {
          errorCodeRef.current = '405';
          console.error('❌ SCORM Error: Invalid value for', element, ':', value);
          addEvent({ type: 'setValue', element, value, success: false, errorCode: '405' });
          return 'false';
        }

        scormDataRef.current[element] = value;
        errorCodeRef.current = '0';
        console.log('✅ SCORM API: Successfully set', element, '=', value);
        addEvent({ type: 'setValue', element, value, success: true, errorCode: '0' });
        
        // Update package data if we have one
        if (currentPackage) {
          setCurrentPackage(prev => prev ? {
            ...prev,
            data: { ...prev.data, [element]: value as any }
          } : null);
        }
        
        return 'true';
      },

      LMSCommit: (parameter: string): string => {
        console.log('💾 SCORM API: LMSCommit called with parameter:', parameter);
        if (parameter !== '') {
          errorCodeRef.current = '201';
          console.error('❌ SCORM Error: Invalid parameter for LMSCommit');
          addEvent({ type: 'commit', success: false, errorCode: '201' });
          return 'false';
        }
        
        if (!isInitialized) {
          errorCodeRef.current = '301';
          console.error('❌ SCORM Error: Not initialized');
          addEvent({ type: 'commit', success: false, errorCode: '301' });
          return 'false';
        }

        errorCodeRef.current = '0';
        console.log('✅ SCORM API: Data committed successfully');
        addEvent({ type: 'commit', success: true, errorCode: '0' });
        return 'true';
      },

      LMSGetLastError: (): string => {
        console.log('🔍 SCORM API: LMSGetLastError called, returning:', errorCodeRef.current);
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
        console.log('📋 SCORM API: LMSGetErrorString called for code:', errorCode, '- Message:', message);
        addEvent({ type: 'getErrorString', value: message, success: true, errorCode: '0' });
        return message;
      },

      LMSGetDiagnostic: (errorCode: string): string => {
        const diagnostic = `Diagnostic information for error ${errorCode}`;
        console.log('🔧 SCORM API: LMSGetDiagnostic called for code:', errorCode);
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
import React, { useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ScormEvent } from '../types/scorm';

interface EventLoggerProps {
  events: ScormEvent[];
}

export const EventLogger: React.FC<EventLoggerProps> = ({ events }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const getEventIcon = (event: ScormEvent) => {
    if (!event.success) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    switch (event.type) {
      case 'initialize':
      case 'terminate':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'setValue':
      case 'getValue':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'commit':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventColor = (event: ScormEvent) => {
    if (!event.success) return 'border-red-200 bg-red-50';
    
    switch (event.type) {
      case 'initialize':
      case 'terminate':
        return 'border-green-200 bg-green-50';
      case 'setValue':
      case 'getValue':
        return 'border-blue-200 bg-blue-50';
      case 'commit':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatEventDescription = (event: ScormEvent) => {
    const { type, element, value, success, errorCode } = event;
    
    if (type === 'setValue' && element && value) {
      return `Set ${element} = "${value}"`;
    }
    
    if (type === 'getValue' && element) {
      return `Get ${element}${value ? ` = "${value}"` : ''}`;
    }
    
    if (type === 'initialize') {
      return success ? 'SCORM session initialized' : 'Failed to initialize SCORM session';
    }
    
    if (type === 'terminate') {
      return success ? 'SCORM session terminated' : 'Failed to terminate SCORM session';
    }
    
    if (type === 'commit') {
      return success ? 'Data committed to LMS' : 'Failed to commit data';
    }
    
    return `${type}${!success ? ' (failed)' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
        SCORM Events
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {events.length}
        </span>
      </h2>
      
      <div 
        ref={logRef}
        className="h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50"
      >
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No SCORM events yet</p>
            <p className="text-sm mt-1">Events will appear here when the SCORM content interacts with the API</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getEventColor(event)}`}
            >
              {getEventIcon(event)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    {formatEventDescription(event)}
                  </p>
                  <span className="text-xs text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {event.errorCode !== '0' && (
                  <p className="text-xs text-red-600 mt-1">
                    Error {event.errorCode}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {events.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {events.length} event{events.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
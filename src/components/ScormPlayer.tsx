import React, { useEffect, useRef } from 'react';
import { ScormPackage } from '../types/scorm';

interface ScormPlayerProps {
  package: ScormPackage;
  scormApi: any;
}

export const ScormPlayer: React.FC<ScormPlayerProps> = ({ package: scormPackage, scormApi }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && scormApi) {
      // Make SCORM API available to the iframe content
      const iframe = iframeRef.current;
      
      const handleLoad = () => {
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            // Inject SCORM API into the iframe's global scope
            (iframeWindow as any).API = scormApi();
            (iframeWindow as any).API_1484_11 = scormApi(); // For SCORM 2004
            
            console.log('SCORM API injected into iframe');
          }
        } catch (error) {
          console.error('Failed to inject SCORM API:', error);
        }
      };

      iframe.addEventListener('load', handleLoad);
      
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [scormApi]);

  // For demo purposes, we'll show a sample SCORM content
  // In production, this would load the actual SCORM package content
  const demoScormContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Demo SCORM Content</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                max-width: 600px;
                text-align: center;
            }
            button {
                background: #4f46e5;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
                transition: background 0.3s;
            }
            button:hover {
                background: #3730a3;
            }
            .progress {
                width: 100%;
                height: 20px;
                background: rgba(255,255,255,0.2);
                border-radius: 10px;
                overflow: hidden;
                margin: 20px 0;
            }
            .progress-bar {
                height: 100%;
                background: #10b981;
                width: 0%;
                transition: width 0.5s ease;
                border-radius: 10px;
            }
            .status {
                margin: 20px 0;
                padding: 15px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Demo SCORM Content</h1>
            <p>Package: ${scormPackage.name}</p>
            <p>This is a demonstration of SCORM API communication.</p>
            
            <div class="status" id="status">
                Status: Not Started
            </div>
            
            <div class="progress">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            
            <div>
                <button onclick="startLesson()">Start Lesson</button>
                <button onclick="setProgress(50)">Set Progress 50%</button>
                <button onclick="setProgress(100)">Complete Lesson</button>
                <button onclick="getStatus()">Get Status</button>
            </div>
            
            <div class="status" id="apiLog">
                API Log: Ready
            </div>
        </div>
        
        <script>
            let lessonStarted = false;
            let currentProgress = 0;
            
            function logMessage(message) {
                document.getElementById('apiLog').textContent = 'API Log: ' + message;
                console.log('SCORM Demo:', message);
            }
            
            function updateDisplay() {
                document.getElementById('progressBar').style.width = currentProgress + '%';
                document.getElementById('status').textContent = 
                    'Status: ' + (currentProgress === 0 ? 'Not Started' : 
                                 currentProgress === 100 ? 'Completed' : 
                                 'In Progress (' + currentProgress + '%)');
            }
            
            function startLesson() {
                if (typeof API !== 'undefined') {
                    const result = API.LMSInitialize('');
                    if (result === 'true') {
                        API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
                        API.LMSCommit('');
                        lessonStarted = true;
                        logMessage('Lesson initialized successfully');
                    } else {
                        logMessage('Failed to initialize: ' + API.LMSGetLastError());
                    }
                } else {
                    logMessage('SCORM API not available');
                }
            }
            
            function setProgress(percentage) {
                if (!lessonStarted) {
                    startLesson();
                }
                
                if (typeof API !== 'undefined' && lessonStarted) {
                    API.LMSSetValue('cmi.core.score.raw', percentage.toString());
                    
                    if (percentage === 100) {
                        API.LMSSetValue('cmi.core.lesson_status', 'completed');
                        API.LMSFinish('');
                        lessonStarted = false;
                    } else {
                        API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
                    }
                    
                    API.LMSCommit('');
                    currentProgress = percentage;
                    updateDisplay();
                    logMessage('Progress set to ' + percentage + '%');
                } else {
                    logMessage('Cannot set progress: API not initialized');
                }
            }
            
            function getStatus() {
                if (typeof API !== 'undefined') {
                    const status = API.LMSGetValue('cmi.core.lesson_status');
                    const score = API.LMSGetValue('cmi.core.score.raw');
                    logMessage('Status: ' + status + ', Score: ' + score);
                } else {
                    logMessage('SCORM API not available');
                }
            }
            
            // Initialize display
            updateDisplay();
        </script>
    </body>
    </html>
  `;

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{scormPackage.name}</h3>
            <p className="text-sm text-gray-600">SCORM {scormPackage.version}</p>
          </div>
          <div className="text-sm text-gray-500">
            Uploaded: {scormPackage.uploadDate.toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="h-96 lg:h-[600px]">
        <iframe
          ref={iframeRef}
          srcDoc={demoScormContent}
          className="w-full h-full border-0"
          title={`SCORM Content: ${scormPackage.name}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
};
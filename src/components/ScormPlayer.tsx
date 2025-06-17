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
            
            console.log('SCORM API injected into iframe for package:', scormPackage.name);
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
  }, [scormApi, scormPackage.id]); // Added scormPackage.id as dependency

  // Generate package-specific demo content
  const generateScormContent = (pkg: ScormPackage) => {
    const packageColor = pkg.id.slice(-6); // Use last 6 chars of ID for unique color
    const colorMap: Record<string, string> = {
      '0': '#667eea',
      '1': '#764ba2',
      '2': '#f093fb',
      '3': '#f5576c',
      '4': '#4facfe',
      '5': '#00f2fe',
      '6': '#43e97b',
      '7': '#38f9d7',
      '8': '#ffecd2',
      '9': '#fcb69f',
      'a': '#a8edea',
      'b': '#fed6e3',
      'c': '#d299c2',
      'd': '#fef9d7',
      'e': '#667eea',
      'f': '#764ba2'
    };
    
    const primaryColor = colorMap[packageColor[0]] || '#667eea';
    const secondaryColor = colorMap[packageColor[1]] || '#764ba2';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>${pkg.name} - SCORM Content</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  margin: 0; 
                  padding: 20px; 
                  background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
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
                  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
              }
              .package-info {
                  background: rgba(255,255,255,0.1);
                  padding: 20px;
                  border-radius: 10px;
                  margin-bottom: 30px;
                  border: 1px solid rgba(255,255,255,0.2);
              }
              button {
                  background: rgba(255,255,255,0.2);
                  color: white;
                  border: 1px solid rgba(255,255,255,0.3);
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-size: 16px;
                  cursor: pointer;
                  margin: 10px;
                  transition: all 0.3s;
                  backdrop-filter: blur(10px);
              }
              button:hover {
                  background: rgba(255,255,255,0.3);
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              }
              button:active {
                  transform: translateY(0);
              }
              .progress {
                  width: 100%;
                  height: 20px;
                  background: rgba(255,255,255,0.2);
                  border-radius: 10px;
                  overflow: hidden;
                  margin: 20px 0;
                  border: 1px solid rgba(255,255,255,0.3);
              }
              .progress-bar {
                  height: 100%;
                  background: linear-gradient(90deg, #10b981, #34d399);
                  width: 0%;
                  transition: width 0.5s ease;
                  border-radius: 10px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
              .status {
                  margin: 20px 0;
                  padding: 15px;
                  background: rgba(255,255,255,0.1);
                  border-radius: 10px;
                  font-size: 14px;
                  border: 1px solid rgba(255,255,255,0.2);
              }
              .lesson-content {
                  background: rgba(255,255,255,0.05);
                  padding: 25px;
                  border-radius: 15px;
                  margin: 20px 0;
                  border: 1px solid rgba(255,255,255,0.1);
              }
              .lesson-step {
                  background: rgba(255,255,255,0.1);
                  padding: 15px;
                  border-radius: 8px;
                  margin: 10px 0;
                  border-left: 4px solid rgba(255,255,255,0.5);
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>📚 ${pkg.name}</h1>
              
              <div class="package-info">
                  <h3>Package Information</h3>
                  <p><strong>Package ID:</strong> ${pkg.id}</p>
                  <p><strong>SCORM Version:</strong> ${pkg.version}</p>
                  <p><strong>Upload Date:</strong> ${pkg.uploadDate.toLocaleDateString()}</p>
                  <p><strong>Launch URL:</strong> ${pkg.launchUrl}</p>
              </div>
              
              <div class="status" id="status">
                  Status: Not Started
              </div>
              
              <div class="progress">
                  <div class="progress-bar" id="progressBar"></div>
              </div>
              
              <div class="lesson-content">
                  <h3>📖 Lesson Content</h3>
                  <div class="lesson-step">
                      <h4>Step 1: Introduction</h4>
                      <p>Welcome to ${pkg.name}! This is your personalized learning experience.</p>
                  </div>
                  <div class="lesson-step">
                      <h4>Step 2: Learning Objectives</h4>
                      <p>By the end of this lesson, you will understand SCORM communication.</p>
                  </div>
                  <div class="lesson-step">
                      <h4>Step 3: Interactive Activities</h4>
                      <p>Use the buttons below to interact with the SCORM API.</p>
                  </div>
              </div>
              
              <div>
                  <button onclick="startLesson()">🚀 Start Lesson</button>
                  <button onclick="setProgress(25)">📈 25% Progress</button>
                  <button onclick="setProgress(50)">📊 50% Progress</button>
                  <button onclick="setProgress(75)">📈 75% Progress</button>
                  <button onclick="setProgress(100)">✅ Complete Lesson</button>
              </div>
              
              <div>
                  <button onclick="getStatus()">📋 Get Status</button>
                  <button onclick="suspendLesson()">⏸️ Suspend</button>
                  <button onclick="resumeLesson()">▶️ Resume</button>
              </div>
              
              <div class="status" id="apiLog">
                  API Log: Ready for package "${pkg.name}"
              </div>
          </div>
          
          <script>
              let lessonStarted = false;
              let currentProgress = 0;
              let packageId = '${pkg.id}';
              let packageName = '${pkg.name}';
              
              function logMessage(message) {
                  const timestamp = new Date().toLocaleTimeString();
                  document.getElementById('apiLog').innerHTML = 
                      'API Log: [' + timestamp + '] ' + message;
                  console.log('SCORM [' + packageName + ']:', message);
              }
              
              function updateDisplay() {
                  document.getElementById('progressBar').style.width = currentProgress + '%';
                  let statusText = 'Status: ';
                  if (currentProgress === 0) {
                      statusText += 'Not Started';
                  } else if (currentProgress === 100) {
                      statusText += 'Completed ✅';
                  } else {
                      statusText += 'In Progress (' + currentProgress + '%) 📚';
                  }
                  document.getElementById('status').innerHTML = statusText;
              }
              
              function startLesson() {
                  if (typeof API !== 'undefined') {
                      const result = API.LMSInitialize('');
                      if (result === 'true') {
                          API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
                          API.LMSSetValue('cmi.core.lesson_location', 'introduction');
                          API.LMSCommit('');
                          lessonStarted = true;
                          logMessage('Lesson initialized successfully for ' + packageName);
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
                      
                      let location = 'introduction';
                      if (percentage >= 25) location = 'objectives';
                      if (percentage >= 50) location = 'activities';
                      if (percentage >= 75) location = 'assessment';
                      if (percentage === 100) location = 'completed';
                      
                      API.LMSSetValue('cmi.core.lesson_location', location);
                      
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
                      logMessage('Progress set to ' + percentage + '% for ' + packageName);
                  } else {
                      logMessage('Cannot set progress: API not initialized');
                  }
              }
              
              function getStatus() {
                  if (typeof API !== 'undefined') {
                      const status = API.LMSGetValue('cmi.core.lesson_status');
                      const score = API.LMSGetValue('cmi.core.score.raw');
                      const location = API.LMSGetValue('cmi.core.lesson_location');
                      logMessage('Status: ' + status + ', Score: ' + score + ', Location: ' + location);
                  } else {
                      logMessage('SCORM API not available');
                  }
              }
              
              function suspendLesson() {
                  if (typeof API !== 'undefined' && lessonStarted) {
                      API.LMSSetValue('cmi.core.exit', 'suspend');
                      API.LMSCommit('');
                      logMessage('Lesson suspended for ' + packageName);
                  } else {
                      logMessage('Cannot suspend: lesson not started');
                  }
              }
              
              function resumeLesson() {
                  if (typeof API !== 'undefined') {
                      if (!lessonStarted) {
                          startLesson();
                      }
                      API.LMSSetValue('cmi.core.entry', 'resume');
                      API.LMSCommit('');
                      logMessage('Lesson resumed for ' + packageName);
                  } else {
                      logMessage('SCORM API not available');
                  }
              }
              
              // Initialize display
              updateDisplay();
              logMessage('Package "${pkg.name}" loaded and ready');
          </script>
      </body>
      </html>
    `;
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{scormPackage.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>SCORM {scormPackage.version}</span>
              <span>•</span>
              <span>ID: {scormPackage.id}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Uploaded: {scormPackage.uploadDate.toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="h-96 lg:h-[600px]">
        <iframe
          ref={iframeRef}
          key={scormPackage.id} // Force re-render when package changes
          srcDoc={generateScormContent(scormPackage)}
          className="w-full h-full border-0"
          title={`SCORM Content: ${scormPackage.name}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
};
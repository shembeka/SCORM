import React, { useState, useCallback } from 'react';
import { BookOpen, Upload as UploadIcon, Play } from 'lucide-react';
import { ScormUpload } from './components/ScormUpload';
import { ScormPlayer } from './components/ScormPlayer';
import { ProgressTracker } from './components/ProgressTracker';
import { EventLogger } from './components/EventLogger';
import { useScormApi } from './hooks/useScormApi';
import { ScormPackage } from './types/scorm';

function App() {
  const [uploadedPackages, setUploadedPackages] = useState<ScormPackage[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'player'>('upload');
  const { 
    scormApi, 
    currentPackage, 
    setCurrentPackage, 
    events, 
    getProgress 
  } = useScormApi();

  const handlePackageUploaded = useCallback((scormPackage: ScormPackage) => {
    setUploadedPackages(prev => [...prev, scormPackage]);
    setCurrentPackage(scormPackage);
    setActiveView('player');
  }, [setCurrentPackage]);

  const handlePackageSelect = useCallback((scormPackage: ScormPackage) => {
    setCurrentPackage(scormPackage);
    setActiveView('player');
  }, [setCurrentPackage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SCORM Player</h1>
                <p className="text-sm text-gray-600">Upload and play SCORM packages</p>
              </div>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveView('upload')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <UploadIcon className="h-4 w-4" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => setActiveView('player')}
                disabled={!currentPackage}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'player' && currentPackage
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <Play className="h-4 w-4" />
                <span>Player</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'upload' ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload SCORM Package
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your SCORM-compliant learning content to start tracking learner progress 
                and interactions in real-time.
              </p>
            </div>
            
            <ScormUpload onPackageUploaded={handlePackageUploaded} />
            
            {/* Uploaded Packages */}
            {uploadedPackages.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Uploaded Packages ({uploadedPackages.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {uploadedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {pkg.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            SCORM {pkg.version}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {pkg.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Play className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : currentPackage ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SCORM Player - Main Content */}
            <div className="lg:col-span-2">
              <ScormPlayer package={currentPackage} scormApi={scormApi} />
            </div>
            
            {/* Sidebar - Progress and Events */}
            <div className="space-y-6">
              <ProgressTracker getProgress={getProgress} />
              <EventLogger events={events} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No SCORM Package Selected
            </h3>
            <p className="text-gray-600 mb-6">
              Upload a SCORM package to start learning
            </p>
            <button
              onClick={() => setActiveView('upload')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Package
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
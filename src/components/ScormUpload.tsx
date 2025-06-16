import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ScormPackage } from '../types/scorm';

interface ScormUploadProps {
  onPackageUploaded: (scormPackage: ScormPackage) => void;
}

export const ScormUpload: React.FC<ScormUploadProps> = ({ onPackageUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const processScormPackage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // In a real implementation, you would:
      // 1. Extract the ZIP file
      // 2. Parse the imsmanifest.xml
      // 3. Validate SCORM structure
      // 4. Store the content files
      // 5. Extract launch URL from manifest
      
      // For this demo, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const scormPackage: ScormPackage = {
        id: Date.now().toString(),
        name: file.name.replace('.zip', ''),
        version: '1.2', // Would be extracted from manifest
        uploadDate: new Date(),
        manifestUrl: `packages/${file.name}/imsmanifest.xml`,
        launchUrl: `packages/${file.name}/index.html`, // Would be extracted from manifest
        data: {
          'cmi.core.lesson_status': 'not attempted',
          'cmi.core.score.raw': '0',
          'cmi.core.score.max': '100'
        },
        events: []
      };

      onPackageUploaded(scormPackage);
      setUploadStatus('success');
    } catch (error) {
      console.error('Error processing SCORM package:', error);
      setErrorMessage('Failed to process SCORM package. Please ensure it\'s a valid SCORM ZIP file.');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [onPackageUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(file => file.name.toLowerCase().endsWith('.zip'));
    
    if (zipFile) {
      processScormPackage(zipFile);
    } else {
      setErrorMessage('Please upload a ZIP file containing the SCORM package.');
      setUploadStatus('error');
    }
  }, [processScormPackage]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processScormPackage(file);
    }
  }, [processScormPackage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'pointer-events-none opacity-75' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">Processing SCORM Package...</p>
                <p className="text-sm text-gray-500">Extracting and validating content</p>
              </div>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-green-700">Upload Successful!</p>
                <p className="text-sm text-gray-600">Your SCORM package is ready to launch</p>
              </div>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-600" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-red-700">Upload Failed</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">Upload SCORM Package</p>
                <p className="text-sm text-gray-500">
                  Drag and drop your SCORM ZIP file here, or click to browse
                </p>
              </div>
            </>
          )}
        </div>
        
        {uploadStatus === 'idle' && !isProcessing && (
          <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Supports SCORM 1.2 & 2004</span>
            </div>
            <span>•</span>
            <span>ZIP files only</span>
          </div>
        )}
      </div>
    </div>
  );
};
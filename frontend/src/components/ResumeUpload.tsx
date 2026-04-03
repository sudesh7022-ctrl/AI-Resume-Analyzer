'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import axios from 'axios';

import { useAuth } from '@/context/AuthContext';

interface ResumeUploadProps {
  onUploadSuccess: (data: any) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    if (!token) {
      setError('Please log in to upload your resume.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      onUploadSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, token]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  if (!token) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Lock size={32} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Authentication Required
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Please log in or create an account to upload your resume and use the AI Job Matcher.
            </p>
            <a href="/auth" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Log In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
          <Upload size={32} />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            {isDragActive ? 'Drop your resume here' : 'Upload your Resume'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Drag & drop your PDF file or click to browse
          </p>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-in fade-in">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-4 font-medium text-slate-700 dark:text-slate-300">Analyzing your skills...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}

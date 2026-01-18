import React, { useRef, useState } from 'react';
import { Upload, FileVideo, FileImage, X } from 'lucide-react';

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File) => void;
  label?: string;
  icon?: 'image' | 'video';
}

export const FileUpload: React.FC<FileUploadProps> = ({ accept, onFileSelect, label = "Upload File", icon = 'image' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div 
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-slate-800/50 rounded-xl p-8 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center group h-48 relative"
    >
      <input 
        type="file" 
        accept={accept} 
        onChange={handleFileChange} 
        ref={inputRef} 
        className="hidden" 
      />
      
      {selectedFile ? (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-3">
             {icon === 'image' ? <FileImage className="text-purple-400" /> : <FileVideo className="text-purple-400" />}
          </div>
          <p className="text-sm font-medium text-white truncate max-w-[80%]">{selectedFile.name}</p>
          <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <button 
            onClick={clearFile}
            className="mt-3 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs flex items-center space-x-1 transition-colors"
          >
            <X size={12} /> <span>Remove</span>
          </button>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-4 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-400" />
          </div>
          <h3 className="text-slate-200 font-medium">{label}</h3>
          <p className="text-slate-500 text-sm mt-1">Click to browse or drag & drop</p>
        </>
      )}
    </div>
  );
};
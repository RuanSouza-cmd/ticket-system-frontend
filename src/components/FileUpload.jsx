// src/components/FileUpload.jsx - Upload de arquivos com drag & drop

import { useState, useRef } from 'react';
import { ticketsAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';

// Ícones por tipo de arquivo
const FILE_ICONS = {
  'image': 'bx-image',
  'pdf': 'bxs-file-pdf',
  'doc': 'bxs-file-doc',
  'xls': 'bxs-spreadsheet',
  'ppt': 'bxs-slideshow',
  'zip': 'bx-archive',
  'text': 'bx-file-blank',
  'default': 'bx-file'
};

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return FILE_ICONS.image;
  if (mimeType?.includes('pdf')) return FILE_ICONS.pdf;
  if (mimeType?.includes('word') || mimeType?.includes('doc')) return FILE_ICONS.doc;
  if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return FILE_ICONS.xls;
  if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return FILE_ICONS.ppt;
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('7z')) return FILE_ICONS.zip;
  if (mimeType?.includes('text')) return FILE_ICONS.text;
  return FILE_ICONS.default;
};

// Formata tamanho do arquivo
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Tipos permitidos
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUpload({ ticketId, onUploadComplete, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `Arquivo muito grande (máx. 10MB)` };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: `Tipo não permitido: ${file.type}` };
    }
    return { valid: true };
  };

  const uploadFiles = async (files) => {
    if (!ticketId || files.length === 0) return;

    const validFiles = [];
    const errors = [];

    // Valida arquivos
    for (const file of files) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push({ name: file.name, error: validation.error });
      }
    }

    // Mostra erros de validação
    errors.forEach(err => {
      toast.error(`${err.name}: ${err.error}`);
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(validFiles.map(f => ({ name: f.name, progress: 0, status: 'pending' })));

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await ticketsAPI.uploadFiles(ticketId, formData);
      
      const { uploaded, errors: uploadErrors } = response.data;
      
      if (uploaded?.length > 0) {
        toast.success(`${uploaded.length} arquivo(s) enviado(s)!`);
        onUploadComplete?.(uploaded);
      }
      
      uploadErrors?.forEach(err => {
        toast.error(`${err.name}: ${err.error}`);
      });

    } catch (error) {
      const err = handleAPIError(error);
      toast.error(err.message);
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-3">
      {/* Área de Drop */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
          accept={ALLOWED_TYPES.join(',')}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-sm text-base-content/70">Enviando arquivos...</p>
            {uploadProgress.map((file, idx) => (
              <div key={idx} className="text-xs text-base-content/50">
                {file.name}
              </div>
            ))}
          </div>
        ) : (
          <>
            <i className={`bx ${isDragging ? 'bx-cloud-upload' : 'bx-upload'} text-4xl text-primary mb-2`}></i>
            <p className="font-medium">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-xs text-base-content/50 mt-1">
              Imagens, PDFs, documentos Office, textos e arquivos compactados (máx. 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// Componente para listar arquivos anexados
export function FileList({ files = [], ticketId, onDelete, canDelete = false }) {
  const [deleting, setDeleting] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleDelete = async (fileName) => {
    if (!window.confirm('Tem certeza que deseja remover este arquivo?')) return;
    
    setDeleting(fileName);
    try {
      await ticketsAPI.deleteFile(ticketId, fileName);
      toast.success('Arquivo removido!');
      onDelete?.(fileName);
    } catch (error) {
      const err = handleAPIError(error);
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (file) => {
    const token = localStorage.getItem('token');
    const url = ticketsAPI.getFileDownloadUrl(ticketId, file.fileName);
    
    // Cria link temporário com token
    const link = document.createElement('a');
    link.href = `${url}?token=${token}`;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (mimeType) => mimeType?.startsWith('image/');

  if (files.length === 0) {
    return (
      <div className="text-center py-6 text-base-content/50">
        <i className='bx bx-file text-3xl mb-2'></i>
        <p className="text-sm">Nenhum arquivo anexado</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-2">
        {files.map((file, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors group"
          >
            {/* Ícone/Preview */}
            <div className="flex-shrink-0">
              {isImage(file.mimeType) ? (
                <div 
                  className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer bg-base-300"
                  onClick={() => setPreviewImage(file)}
                >
                  <img 
                    src={`${ticketsAPI.getFilePreviewUrl(ticketId, file.fileName)}?token=${localStorage.getItem('token')}`}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-base-content/50">
                    <i className='bx bx-image text-2xl'></i>
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className={`bx ${getFileIcon(file.mimeType)} text-2xl text-primary`}></i>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" title={file.originalName}>
                {file.originalName}
              </p>
              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <span>{file.sizeFormatted || formatFileSize(file.size)}</span>
                {file.uploadedBy?.displayName && (
                  <>
                    <span>•</span>
                    <span>{file.uploadedBy.displayName}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Ações */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => handleDownload(file)}
                title="Baixar"
              >
                <i className='bx bx-download text-lg'></i>
              </button>
              
              {canDelete && (
                <button
                  className="btn btn-ghost btn-sm btn-circle text-error"
                  onClick={() => handleDelete(file.fileName)}
                  disabled={deleting === file.fileName}
                  title="Remover"
                >
                  {deleting === file.fileName ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <i className='bx bx-trash text-lg'></i>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Preview de Imagem */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-primary transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <i className='bx bx-x text-3xl'></i>
            </button>
            <img
              src={`${ticketsAPI.getFilePreviewUrl(ticketId, previewImage.fileName)}?token=${localStorage.getItem('token')}`}
              alt={previewImage.originalName}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-2">{previewImage.originalName}</p>
          </div>
        </div>
      )}
    </>
  );
}

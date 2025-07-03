import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Eye, 
  Download,
  Camera,
  FileImage,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function ImageUploader({ 
  onImagesChange,
  maxImages = 5,
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = ""
}) {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Compress image to reduce file size
  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            }));
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Validate file
  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSizePerImage) {
      return `Arquivo muito grande. Máximo: ${(maxSizePerImage / 1024 / 1024).toFixed(1)}MB`;
    }
    
    return null;
  };

  // Process selected files
  const processFiles = async (fileList) => {
    const files = Array.from(fileList);
    
    if (images.length + files.length > maxImages) {
      setError(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const processedImages = [];

      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        // Compress image
        const compressedFile = await compressImage(file);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(compressedFile);
        
        const imageData = {
          id: Date.now() + Math.random(),
          file: compressedFile,
          previewUrl,
          name: file.name,
          size: compressedFile.size,
          type: compressedFile.type,
          originalSize: file.size
        };

        processedImages.push(imageData);
      }

      const newImages = [...images, ...processedImages];
      setImages(newImages);
      
      if (onImagesChange) {
        onImagesChange(newImages);
      }
    } catch (err) {
      setError('Erro ao processar imagens');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove image
  const removeImage = (imageId) => {
    const newImages = images.filter(img => img.id !== imageId);
    setImages(newImages);
    
    if (onImagesChange) {
      onImagesChange(newImages);
    }
    
    // Clean up preview URL
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
  };

  // Download image
  const downloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image.previewUrl;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span>Imagens</span>
            {images.length > 0 && (
              <Badge variant="secondary">{images.length}/{maxImages}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Processando imagens...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Adicionar Imagens
                  </p>
                  <p className="text-sm text-gray-600">
                    Arraste e solte ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo {maxImages} imagens, {(maxSizePerImage / 1024 / 1024).toFixed(1)}MB cada
                  </p>
                </div>

                <div className="flex justify-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= maxImages}
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={images.length >= maxImages}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Usar Câmera
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.previewUrl}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image overlay with controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewImage(image)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(image)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image info */}
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="truncate">{image.name}</p>
                    <div className="flex justify-between">
                      <span>{formatFileSize(image.size)}</span>
                      {image.originalSize !== image.size && (
                        <span className="text-green-600">
                          -{Math.round((1 - image.size / image.originalSize) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-4xl max-h-full">
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 z-10"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <img
                  src={previewImage.previewUrl}
                  alt={previewImage.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded">
                  <p className="text-sm">{previewImage.name}</p>
                  <p className="text-xs">{formatFileSize(previewImage.size)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


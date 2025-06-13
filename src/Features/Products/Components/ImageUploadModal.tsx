import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlobServiceClient } from "@azure/storage-blob";
import { toast } from "sonner";
import {
  CONTAINER_NAME,
  FOLDER_NAME,
  STORAGE_ACCOUNT_SAS,
} from "@/lib/constants";

interface ImageFile extends File {
  preview?: string;
}

export interface ProcessedImage {
  img_Id: number;
  img_name: string;
  img_type: string;
  img_url: string;
}

export const getBlobServiceClient = () => {
  try {
    return new BlobServiceClient(STORAGE_ACCOUNT_SAS);
  } catch (error) {
    console.error("Error creating blob service client:", error);
    throw new Error("Failed to initialize storage client");
  }
};

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (images: ProcessedImage[]) => void;
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onUpload,
}: ImageUploadModalProps) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const uploadToBlob = async (
    file: File,
    index: number
  ): Promise<ProcessedImage> => {
    try {
      const blobServiceClient = getBlobServiceClient();
      const containerClient =
        blobServiceClient.getContainerClient(CONTAINER_NAME);
      const timestamp = Date.now();
      const blobName = `${FOLDER_NAME}/${timestamp}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const uploadResponse = await blockBlobClient.uploadBrowserData(file, {
        blobHTTPHeaders: { blobContentType: file.type },
      });

      if (uploadResponse.errorCode) {
        throw new Error(
          `Upload failed with error: ${uploadResponse.errorCode}`
        );
      }

      // Get the final URL from the blob client 
      // "https://actify.blob.core.windows.net/cms/ecom/1749712353275-4114b63077a9a31f01b66840d9d8eada.jpg?sp=racwdli&st=2025-04-30T09:29:16Z&se=2026-04-30T17:29:16Z&spr=https&sv=2024-11-04&sr=c&sig=JvQdFfWzTJeb%2FtFpG6pxJG%2B5%2FlMLEbqdMR%2F6%2Fg%2BKNmU%3D"

      const img_url = blockBlobClient.url;

      console.log(img_url);
      
      return {
        img_Id: timestamp + index,
        img_name: file.name,
        img_type: file.type.split("/")[1],
        img_url,
      };
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map((file) => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
    });
    setFiles((prev) => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  const handleUpload = async () => {
    setIsUploading(true);
    const uploadedImages: ProcessedImage[] = [];

    try {
      // Upload files one by one and collect results
      for (let i = 0; i < files.length; i++) {
        const result = await uploadToBlob(files[i], i);
        uploadedImages.push(result);
      }

      // Only call onUpload if we have successfully uploaded images
      if (uploadedImages.length > 0) {
        onUpload(uploadedImages);
        toast.success("Images uploaded successfully!");
        setFiles([]);
        onClose();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      // Cleanup previews
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby="Image upload dialog"
        className="sm:max-w-[500px] p-0 overflow-hidden bg-white"
      >
        <DialogHeader>
          <DialogTitle className="bg-white p-4 border-b border-gray-200">
            <p className="text-xl font-semibold mb-4">Upload your images:</p>
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8
              transition-colors duration-200 ease-in-out
              flex flex-col items-center justify-center gap-2
              min-h-[200px] cursor-pointer
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
              }
            `}
          >
            <input {...getInputProps()} />
            <ImageIcon className="w-12 h-12 text-primary" strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-lg font-medium">Drag & Drop</p>
              <p className="text-sm text-muted-foreground">
                or <span className="text-primary cursor-pointer">browse</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supports: JPEG, JPG, PNG, WEBP
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {file.preview && (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-8 w-8 object-cover rounded"
                      />
                    )}
                    <span className="text-sm truncate max-w-[300px]">
                      {file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="px-6"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageUploadModal;

// import { useState, useCallback } from "react"
// import { useDropzone } from "react-dropzone"
// import { ImageIcon, X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent } from "@/components/ui/dialog"

// interface ImageUploadModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onUpload: (files: File[]) => void
// }

// export function ImageUploadModal({ isOpen, onClose, onUpload }: ImageUploadModalProps) {
//   const [files, setFiles] = useState<File[]>([])

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     setFiles((prev) => [...prev, ...acceptedFiles])
//   }, [])

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       "image/jpeg": [".jpg", ".jpeg"],
//       "image/png": [".png"],
//     },
//   })

//   const handleUpload = () => {
//     onUpload(files)
//     setFiles([])
//     onClose()
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white">
//         <div className="p-6">
//           <h2 className="text-xl font-semibold mb-4">Upload your File :</h2>
//           <div
//             {...getRootProps()}
//             className={`
//               border-2 border-dashed rounded-xl p-8
//               transition-colors duration-200 ease-in-out
//               flex flex-col items-center justify-center gap-2
//               min-h-[200px] cursor-pointer
//               ${
//                 isDragActive
//                   ? "border-primary bg-primary/5"
//                   : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
//               }
//             `}
//           >
//             <input {...getInputProps()} />
//             <ImageIcon className="w-12 h-12 text-primary" strokeWidth={1.5} />
//             <div className="text-center">
//               <p className="text-lg font-medium">Drag & Drop</p>
//               <p className="text-sm text-muted-foreground">
//                 or <span className="text-primary cursor-pointer">browse</span>
//               </p>
//             </div>
//             <p className="text-xs text-muted-foreground mt-2">Supports: JPEG, JPG, PNG</p>
//           </div>

//           {files.length > 0 && (
//             <div className="mt-4 space-y-2">
//               {files.map((file, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
//                   <span className="text-sm truncate max-w-[300px]">{file.name}</span>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 text-muted-foreground hover:text-foreground"
//                     onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="flex justify-end space-x-2 mt-6">
//             <Button variant="outline" onClick={onClose} className="px-6">
//               Cancel
//             </Button>
//             <Button onClick={handleUpload} disabled={files.length === 0} className="px-6">
//               Upload
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

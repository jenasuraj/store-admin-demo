// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// interface Image {
//   id: number
//   url: string
//   name: string
//   type: string
// }

// interface ImageViewModalProps {
//   isOpen: boolean
//   onClose: () => void
//   images: Image[]
//   onDelete: (imageId: number) => void
// }

// export function ImageViewModal({ isOpen, onClose, images, onDelete }: ImageViewModalProps) {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0)

//   useEffect(() => {
//     if (images.length === 0) {
//       onClose()
//     } else if (currentImageIndex >= images.length) {
//       setCurrentImageIndex(images.length - 1)
//     }
//   }, [images, currentImageIndex, onClose])

//   const handlePrevious = () => {
//     setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
//   }

//   const handleNext = () => {
//     setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
//   }

//   const handleDelete = () => {
//     onDelete(images[currentImageIndex].id)
//     if (images.length === 1) {
//       onClose()
//     } else if (currentImageIndex === images.length - 1) {
//       setCurrentImageIndex(currentImageIndex - 1)
//     }
//   }

//   if (images.length === 0) {
//     return null
//   }

//   const currentImage = images[currentImageIndex]

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[800px]">
//         <DialogHeader>
//           <DialogTitle>View Images</DialogTitle>
//         </DialogHeader>
//         <div className="flex flex-col items-center">
//           <img
//             src={currentImage.url || "/placeholder.svg"}
//             alt={currentImage.name}
//             className="max-h-[400px] object-contain"
//           />
//           <div className="mt-4 flex justify-between w-full">
//             <Button onClick={handlePrevious}>Previous</Button>
//             <Button onClick={handleDelete} variant="destructive">
//               Delete
//             </Button>
//             <Button onClick={handleNext}>Next</Button>
//           </div>
//           <p className="mt-2 text-sm text-gray-500">
//             {currentImageIndex + 1} of {images.length}
//           </p>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// interface Image {
//   id: number
//   url: string
//   name: string
//   type: string
// }

// interface ImageViewModalProps {
//   isOpen: boolean
//   onClose: () => void
//   images: Image[]
//   onDelete: (imageId: number) => void
// }

// export function ImageViewModal({ isOpen, onClose, images, onDelete }: ImageViewModalProps) {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0)

//   // Reset currentImageIndex when images array changes or modal opens
//   useEffect(() => {
//     if (isOpen) {
//       setCurrentImageIndex(0)
//     }
//   }, [isOpen])

//   // Handle empty images array or invalid currentImageIndex
//   useEffect(() => {
//     if (images.length === 0) {
//       onClose()
//     } else if (currentImageIndex >= images.length) {
//       setCurrentImageIndex(Math.max(0, images.length - 1))
//     }
//   }, [images, currentImageIndex, onClose])

//   // Guard clause for empty images array
//   if (images.length === 0) {
//     return null
//   }

//   const handlePrevious = () => {
//     setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
//   }

//   const handleNext = () => {
//     setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
//   }

//   const handleDelete = () => {
//     const imageToDelete = images[currentImageIndex]
//     if (!imageToDelete) return

//     onDelete(imageToDelete.id)
    
//     // Handle index updates after deletion
//     if (images.length <= 1) {
//       onClose()
//     } else if (currentImageIndex === images.length - 1) {
//       setCurrentImageIndex(currentImageIndex - 1)
//     }
//   }

//   // Guard clause and safe access to current image
//   const currentImage = images[currentImageIndex]
//   if (!currentImage) {
//     return null
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[800px]">
//         <DialogHeader>
//           <DialogTitle>View Images</DialogTitle>
//         </DialogHeader>
//         <div className="flex flex-col items-center">
//           <img
//             src={currentImage.url || "/placeholder.svg"}
//             alt={currentImage.name}
//             className="max-h-[400px] object-contain"
//           />
//           <div className="mt-4 flex justify-between w-full">
//             <Button 
//               onClick={handlePrevious}
//               disabled={images.length <= 1}
//             >
//               Previous
//             </Button>
//             <Button 
//               onClick={handleDelete} 
//               variant="destructive"
//             >
//               Delete
//             </Button>
//             <Button 
//               onClick={handleNext}
//               disabled={images.length <= 1}
//             >
//               Next
//             </Button>
//           </div>
//           <p className="mt-2 text-sm text-gray-500">
//             {currentImageIndex + 1} of {images.length}
//           </p>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }


import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Image {
  id: number
  url: string
  name: string
  type: string
}

interface ImageViewModalProps {
  isOpen: boolean
  onClose: () => void
  images: Image[]
  onDelete: (imageId: number) => void
}

export function ImageViewModal({ isOpen, onClose, images, onDelete }: ImageViewModalProps) {
  // Guard clause for empty images array
  if (images.length === 0) {
    return null
  }

  const handleDelete = (imageId: number) => {
    onDelete(imageId)

    // Close the modal if all images are deleted
    if (images.length <= 1) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Images</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url || "/placeholder.svg"}
                alt={image.name}
                className="w-full h-40 object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(image.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}


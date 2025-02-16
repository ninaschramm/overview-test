import { v4 as uuidv4 } from "uuid"; // Import UUID generator
import { ImageFile } from "../context/AnnotationContext.tsx"

export const processUploadedImages = (files: File[]): Promise<ImageFile[]> => {
  return Promise.all(
    files.map((file) => {
      return new Promise<ImageFile>((resolve) => {
        const img = new Image();
        const objectURL = URL.createObjectURL(file);
        const id = parseInt(uuidv4().replace(/\D/g, "").slice(0, 12), 10);

        img.onload = () => {
          const maxWidth = 700;
          let newWidth = img.width;
          let newHeight = img.height;

          if (img.width > maxWidth) {
            const scaleFactor = maxWidth / img.width;
            newWidth = Math.round(img.width * scaleFactor);
            newHeight = Math.round(img.height * scaleFactor);
          }

          const canvas = document.createElement("canvas");
          canvas.width = newWidth;
          canvas.height = newHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            console.error("⚠️ Could not create canvas context.");
            resolve({
              id, // 🔹 Generate unique ID here
              file: objectURL,
              name: file.name,
              dimensions: { width: img.width, height: img.height }
            });
            return;
          }

          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob((blob) => {
            if (!blob) {
              console.error("⚠️ Could not convert image to Blob.");
              resolve({
                id, // 🔹 Generate unique ID here
                file: objectURL,
                name: file.name,
                dimensions: { width: img.width, height: img.height }
              });
              return;
            }

            const resizedObjectURL = URL.createObjectURL(blob);
            resolve({
              id, // 🔹 Generate unique ID here
              file: resizedObjectURL,
              name: file.name,
              dimensions: { width: newWidth, height: newHeight }
            });
          }, file.type);
        };

        img.src = objectURL;
      });
    })
  );
};

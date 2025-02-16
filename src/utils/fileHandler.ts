export const processUploadedImages = (files: File[]): Promise<{ file: string; name: string; dimensions: { width: number; height: number } }[]> => {
  return Promise.all(
    files.map((file) => {
      return new Promise<{ file: string; name: string; dimensions: { width: number; height: number } }>((resolve) => {
        const img = new Image();
        const objectURL = URL.createObjectURL(file);

        img.onload = () => {
          resolve({
            file: objectURL,
            name: file.name,
            dimensions: { width: img.width, height: img.height }
          });
        };

        img.src = objectURL;
      });
    })
  );
};

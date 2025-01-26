"use client"

const PORT = 3001;

export const uploadPDF = async (files) => {

  // Validate files
  if (files.length === 0) {
    console.error('No files selected');
    return;
  }

  const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
  
  if (pdfFiles.length === 0) {
    console.error('No PDF files selected');
    return;
  }

  const formData = new FormData();
  pdfFiles.forEach(file => formData.append('pdfs', file));

  try {
    const response = await fetch(`http://localhost:${PORT}/pdf-upload`, {
      method: 'POST',
      body: formData,
      // Optional: Add headers if needed
      // headers: {
      //   'Content-Type': 'multipart/form-data' // Often not needed with FormData
      // }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error: ${response.status} - ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Network or upload error:', error);
  }
}

export { uploadPDF };
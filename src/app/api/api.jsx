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

// Start transcription
const startTranscription = async () => {
  try {
    const response = await fetch(`http://localhost:${PORT}/transcription`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error starting transcription:', error);
  }
};

// Stop transcription
const stopTranscription = async () => {
  try {
    const response = await fetch(`http://localhost:${PORT}/stop-transcription`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error stopping transcription:', error);
  }
};

export { uploadPDF, startTranscription, stopTranscription };
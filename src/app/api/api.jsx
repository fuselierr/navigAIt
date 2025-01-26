"use client"

const PORT = 3001;

const uploadPDF = async () => {
    const formData = new FormData();
    const file = document.getElementById('pdfFile').files[0];

    if (!file) {
      alert('Please select a PDF file!');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file!');
      return;
    }

    formData.append('pdf', file);

    try {
      const response = await fetch(`http://localhost:${PORT}/pdf-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`Response: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

export { uploadPDF };
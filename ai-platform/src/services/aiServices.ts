export const synthesizeObservation = async (studentName: string, file: File) => {
  const formData = new FormData();
  formData.append('student_name', studentName);
  formData.append('file', file);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/process-rag`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error("RAG processing failed");
    return await response.json();
  } catch (error) {
    console.error("Backend Connection Error:", error);
    return null;
  }
};

export const askChatbot = async (studentName: string, message: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, message: message }),
    });

    if (!response.ok) throw new Error("Chat bot processing failed");
    return await response.json();
  } catch (error) {
    console.error("Backend Connection Error:", error);
    return { reply: "Connection Error", blocked: true };
  }
};
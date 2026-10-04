import jsPDF from "jspdf";
import { DocumentQuestionAnswer, StudyNote, ExamAnswerResult } from "../types";

/**
 * Clean text for standard ASCII PDF generation
 */
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[#*`_~]/g, "")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/≠/g, "!=")
    .replace(/×/g, "x")
    .replace(/•/g, "-")
    .trim();
}

/**
 * Generate and download a real PDF for Document Analysis (All questions and rubrics)
 */
export function exportDocumentAnalysisToPdf(
  docTitle: string,
  subject: string,
  fileName: string,
  questions: DocumentQuestionAnswer[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const addNewPageIfNeeded = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      // Header on subsequent pages
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 165);
      doc.text(`Carks Academic Dossier - ${docTitle.slice(0, 45)}`, margin, cursorY);
      cursorY += 8;
      doc.setDrawColor(220, 225, 235);
      doc.line(margin, cursorY - 3, pageWidth - margin, cursorY - 3);
      cursorY += 4;
    }
  };

  // Header Banner
  doc.setFillColor(30, 64, 175); // Deep Blue
  doc.rect(margin, cursorY, contentWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("CARKS ACADEMIC EXAM SOLUTIONS DOSSIER", margin + 6, cursorY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(219, 234, 254);
  doc.text(`Subject: ${subject} | Source: ${fileName} | Total Questions: ${questions.length}`, margin + 6, cursorY + 16);

  cursorY += 28;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(docTitle || "Exam Solutions", contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 6 + 4;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // Render each question
  questions.forEach((q, idx) => {
    addNewPageIfNeeded(35);

    // Question header box
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.roundedRect(margin, cursorY, contentWidth, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(29, 78, 216); // Blue-700
    doc.text(`[${q.marks} Marks] ${q.questionNumber || `Question ${idx + 1}`}`, margin + 4, cursorY + 7);
    cursorY += 14;

    // Question text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const qLines = doc.splitTextToSize(cleanText(q.questionText), contentWidth);
    addNewPageIfNeeded(qLines.length * 5 + 4);
    doc.text(qLines, margin, cursorY);
    cursorY += qLines.length * 5 + 4;

    // Model Answer label
    addNewPageIfNeeded(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text("EXEMPLARY MODEL ANSWER:", margin, cursorY);
    cursorY += 5;

    // Model Answer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const ansLines = doc.splitTextToSize(cleanText(q.modelAnswer), contentWidth);
    
    // Write line by line with pagination
    ansLines.forEach((line: string) => {
      addNewPageIfNeeded(5);
      doc.text(line, margin, cursorY);
      cursorY += 4.5;
    });

    cursorY += 3;

    // Examiner Rubric Table
    if (q.rubric && q.rubric.length > 0) {
      addNewPageIfNeeded(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("EXAMINER MARKING RUBRIC & ASSESSMENT OBJECTIVES:", margin, cursorY);
      cursorY += 4.5;

      q.rubric.forEach((r) => {
        const rubricText = `• [${cleanText(r.marks)}] ${cleanText(r.objective)}: ${cleanText(r.criteria)}`;
        const rLines = doc.splitTextToSize(rubricText, contentWidth - 4);
        addNewPageIfNeeded(rLines.length * 4.5 + 2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(rLines, margin + 2, cursorY);
        cursorY += rLines.length * 4 + 2;
      });
    }

    cursorY += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;
  });

  // Footer page numbers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} · Carks Academic Solutions`, pageWidth / 2, pageHeight - 8, { align: "center" });
  }

  const cleanFileName = (docTitle || "Exam_Solutions").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${cleanFileName}.pdf`);
}

/**
 * Generate and download a real PDF for a Single Note or Exam Answer
 */
export function exportSingleNoteToPdf(
  title: string,
  content: string,
  subject: string,
  marks?: number
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const addNewPageIfNeeded = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 165);
      doc.text(`Carks Academic Note - ${title.slice(0, 45)}`, margin, cursorY);
      cursorY += 8;
      doc.setDrawColor(220, 225, 235);
      doc.line(margin, cursorY - 3, pageWidth - margin, cursorY - 3);
      cursorY += 4;
    }
  };

  // Header Banner
  doc.setFillColor(30, 64, 175);
  doc.rect(margin, cursorY, contentWidth, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("CARKS ACADEMIC STUDY DOSSIER", margin + 6, cursorY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(219, 234, 254);
  doc.text(`Subject: ${subject} ${marks ? `| Mark Allocation: ${marks} Marks` : ""} | Exported: ${new Date().toLocaleDateString()}`, margin + 6, cursorY + 14);

  cursorY += 24;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 6 + 6;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const contentLines = doc.splitTextToSize(cleanText(content), contentWidth);

  contentLines.forEach((line: string) => {
    addNewPageIfNeeded(5);
    doc.text(line, margin, cursorY);
    cursorY += 4.8;
  });

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} · Carks Academic Notes`, pageWidth / 2, pageHeight - 8, { align: "center" });
  }

  const cleanFileName = title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
  doc.save(`${cleanFileName}.pdf`);
}

/**
 * Generate and download a high-fidelity Microsoft Word (.doc) document
 */
export function exportToWordDoc(
  title: string,
  contentHtml: string,
  subject: string,
  fileName: string = "Document"
) {
  const wordTemplate = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #1e293b; padding: 24pt; }
        h1 { color: #1d4ed8; font-size: 22pt; border-bottom: 2pt solid #2563eb; padding-bottom: 6pt; }
        h2 { color: #0f172a; font-size: 15pt; margin-top: 16pt; }
        h3 { color: #1e40af; font-size: 12pt; }
        .meta { font-size: 10pt; color: #64748b; margin-bottom: 14pt; }
        .box { background: #f8fafc; border-left: 4pt solid #2563eb; padding: 10pt; margin: 12pt 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 10pt; }
        th, td { border: 1pt solid #cbd5e1; padding: 6pt 8pt; font-size: 10pt; text-align: left; }
        th { background-color: #eff6ff; font-weight: bold; color: #1e3a8a; }
        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">
        <strong>Subject:</strong> ${subject} | <strong>Exported:</strong> ${new Date().toLocaleDateString()}
      </div>
      <hr/>
      ${contentHtml}
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", wordTemplate], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const cleanFileName = title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 45);
  link.download = `${cleanFileName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

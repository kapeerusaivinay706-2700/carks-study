import React from "react";
import { Printer, X, FileDown, BookOpen, Download } from "lucide-react";
import { StudyNote } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { exportSingleNoteToPdf } from "../utils/pdfExport";

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleDoc?: {
    title: string;
    content: string;
    subject: string;
    metadata?: any;
  } | null;
  batchDocs?: StudyNote[] | null;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  singleDoc,
  batchDocs,
}) => {
  if (!isOpen) return null;

  const isBatch = Array.isArray(batchDocs) && batchDocs.length > 0;

  const handlePrint = () => {
    window.print();
  };

  // Direct standalone printable download that works in any browser
  const handleDownloadStandaloneHtml = () => {
    const docTitle = isBatch
      ? `Carks_Exam_Questions_Solutions_${batchDocs?.length || 0}_Notes`
      : singleDoc?.title?.replace(/[^a-zA-Z0-9]/g, "_") || "Carks_Study_Notes";

    let bodyHtml = "";
    if (isBatch && batchDocs) {
      bodyHtml = `
        <div style="text-align: center; padding-bottom: 24px; border-bottom: 2px solid #1c1917; margin-bottom: 32px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78716c; font-weight: 600;">Carks Academic Revision Dossier</p>
          <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 8px 0; color: #1c1917;">Exam Questions & Model Answers Dossier</h1>
          <p style="font-size: 12px; color: #57534e;">Generated on ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })} · ${batchDocs.length} Total Questions Included</p>
        </div>
      `;

      batchDocs.forEach((note, idx) => {
        bodyHtml += `
          <div style="${idx > 0 ? "page-break-before: always; break-before: page; margin-top: 32px; padding-top: 24px;" : ""}">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: 700; color: #854d0e; text-transform: uppercase;">${note.subject} ${note.marksAssociated ? `· ${note.marksAssociated} Marks` : ""}</span>
              <span style="font-size: 11px; color: #78716c; font-family: monospace;">Question #${idx + 1}</span>
            </div>
            <h2 style="font-family: Georgia, serif; font-size: 20px; color: #1c1917; margin-bottom: 16px;">${note.title}</h2>
            <div style="font-size: 13px; line-height: 1.7; color: #292524;">
              ${note.content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}
            </div>
          </div>
        `;
      });
    } else if (singleDoc) {
      bodyHtml = `
        <div style="border-bottom: 2px solid #1c1917; padding-bottom: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #78716c; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #854d0e; text-transform: uppercase;">${singleDoc.subject}</span>
            <span>${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</span>
          </div>
          <h1 style="font-family: Georgia, serif; font-size: 26px; color: #1c1917; margin: 0;">${singleDoc.title}</h1>
        </div>
        <div style="font-size: 14px; line-height: 1.7; color: #292524;">
          ${singleDoc.content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}
        </div>
      `;
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    @page { margin: 15mm; size: A4; }
    body { font-family: 'Times New Roman', Times, serif, system-ui; max-width: 800px; margin: 0 auto; padding: 24px; color: #1c1917; line-height: 1.6; }
    h1, h2, h3 { font-family: Georgia, serif; color: #0c0a09; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th, td { border: 1px solid #d6d3d1; padding: 8px 10px; text-align: left; }
    th { background-color: #f5f5f4; font-weight: 700; }
    blockquote { border-left: 3px solid #d97706; background-color: #fffbeb; padding: 8px 12px; margin: 12px 0; color: #92400e; }
    code { font-family: monospace; background-color: #f5f5f4; padding: 2px 4px; border-radius: 3px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #f5f5f4; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e7e5e4;">
    <span style="font-size: 13px; font-weight: 600; font-family: sans-serif;">Carks PDF Exporter Ready</span>
    <button onclick="window.print()" style="background: #1c1917; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; font-family: sans-serif;">Print / Save as PDF Now</button>
  </div>
  ${bodyHtml}
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 300);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docTitle}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-2 sm:p-6">
      {/* Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Action Bar (Hidden during actual print) */}
        <div className="no-print p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 leading-tight">
                {isBatch ? `Print / PDF Export (${batchDocs?.length} Questions Booklet)` : "Print / PDF Preview"}
              </h3>
              <p className="text-xs text-stone-500">
                Print directly or download the standalone printable PDF sheet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {singleDoc && (
              <button
                type="button"
                onClick={() =>
                  exportSingleNoteToPdf(
                    singleDoc.title,
                    singleDoc.content,
                    singleDoc.subject,
                    singleDoc.metadata?.marks
                  )
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer shadow-sm active:scale-95"
                title="Download formatted .pdf directly"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Save PDF (.pdf)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Dialog</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="printable-document flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-stone-900">
          {isBatch ? (
            <div className="space-y-12">
              {/* Booklet Title Sheet */}
              <div className="text-center py-8 border-b-2 border-stone-900">
                <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                  Carks Academic Revision Dossier
                </span>
                <h1 className="font-editorial text-4xl font-bold text-stone-900 mt-2">
                  Comprehensive Exam Questions & Answers
                </h1>
                <p className="text-xs text-stone-600 mt-2">
                  Generated on {new Date().toLocaleDateString(undefined, { dateStyle: "long" })} · {batchDocs?.length} Questions Included
                </p>
              </div>

              {/* Each Question with page break */}
              {batchDocs?.map((note, idx) => (
                <div key={note.id} className={idx > 0 ? "page-break pt-8" : ""}>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      {note.subject} {note.marksAssociated ? `· ${note.marksAssociated} Marks` : ""}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      Question #{idx + 1}
                    </span>
                  </div>

                  <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-4">
                    {note.title}
                  </h2>

                  <div className="prose-academic">
                    <MarkdownRenderer content={note.content} />
                  </div>
                </div>
              ))}
            </div>
          ) : singleDoc ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header */}
              <div className="border-b border-stone-300 pb-4">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span className="font-semibold text-amber-900 uppercase tracking-wider">
                    {singleDoc.subject}
                  </span>
                  <span>{new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</span>
                </div>
                <h1 className="font-editorial text-3xl font-bold text-stone-900">
                  {singleDoc.title}
                </h1>
              </div>

              {/* Main Content */}
              <div className="prose-academic">
                <MarkdownRenderer content={singleDoc.content} />
              </div>

              {/* Footer */}
              <div className="border-t border-stone-200 pt-4 mt-8 text-center text-[10px] text-stone-400">
                Carks — AI Study Notes & Exam Answers · Academic Reference Copy
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};


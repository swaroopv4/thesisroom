export async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false });
  const timeout = setTimeout(() => task.destroy(), 20000);
  let doc;
  try { doc = await task.promise; } catch { throw new Error("PDF extraction could not start. Try the file again or paste its extracted text."); } finally { clearTimeout(timeout); }
  try {
    if (doc.numPages > 100) throw new Error("Use a PDF with 100 pages or fewer for this prototype.");
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i), text = await page.getTextContent();
      pages.push(`[Page ${i}]\n` + text.items.map(item => "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "").join(""));
      if (pages.join("\n\n").length > 120000) throw new Error("This PDF contains more than 120,000 text characters. Import a shorter section.");
      page.cleanup();
    }
    if (pages.join("").replace(/\[Page \d+\]/g, "").trim().length < 30) throw new Error("This PDF has too little selectable text. OCR scanned pages before importing.");
    return pages.join("\n\n");
  } finally { await doc.destroy(); }
}

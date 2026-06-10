function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
const PDF_MARGIN_LEFT = 50;
const PDF_MARGIN_TOP = 760;
const PDF_LINE_HEIGHT = 15;
const PDF_SECTION_GAP = 10;
const PDF_BOTTOM_MARGIN = 56;

export type PdfSection = {
  title: string;
  lines: string[];
};

type PdfTextBlock = {
  fontSize: number;
  bold?: boolean;
  text: string;
};

function pdfTextCommand(block: PdfTextBlock): string[] {
  const font = block.bold ? "/F2" : "/F1";
  return [`${font} ${block.fontSize} Tf`, `(${escapePdfText(block.text)}) Tj`];
}

function buildPdfContentStream(blocks: { x: number; y: number; block: PdfTextBlock }[]): string {
  const commands = ["BT"];
  let currentY: number | null = null;

  for (const item of blocks) {
    if (currentY !== item.y) {
      if (currentY !== null) commands.push("ET", "BT");
      commands.push(`${item.x} ${item.y} Td`);
      currentY = item.y;
    } else {
      commands.push(`0 -${PDF_LINE_HEIGHT} Td`);
    }
    commands.push(...pdfTextCommand(item.block));
  }

  commands.push("ET");
  return commands.join("\n");
}

export function buildStructuredPdfBlob(
  header: { title: string; subtitle?: string; meta?: string[] },
  sections: PdfSection[],
): Blob {
  const blocks: { x: number; y: number; block: PdfTextBlock }[] = [];
  let y = PDF_MARGIN_TOP;

  function ensureSpace(linesNeeded: number) {
    if (y - linesNeeded * PDF_LINE_HEIGHT < PDF_BOTTOM_MARGIN) {
      y = PDF_MARGIN_TOP;
    }
  }

  function addBlock(block: PdfTextBlock) {
    ensureSpace(1);
    blocks.push({ x: PDF_MARGIN_LEFT, y, block });
    y -= PDF_LINE_HEIGHT;
  }

  addBlock({ fontSize: 22, bold: true, text: header.title });
  if (header.subtitle?.trim()) {
    addBlock({ fontSize: 12, text: header.subtitle.trim() });
  }
  for (const line of header.meta ?? []) {
    if (!line.trim()) continue;
    addBlock({ fontSize: 10, text: line.trim() });
  }

  y -= PDF_SECTION_GAP;

  for (const section of sections) {
    const lines = section.lines.map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    y -= PDF_SECTION_GAP;
    ensureSpace(2);
    addBlock({ fontSize: 13, bold: true, text: section.title });
    y -= 4;

    for (const line of lines) {
      addBlock({ fontSize: 10, text: line });
    }
  }

  const stream = buildPdfContentStream(blocks);
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj`,
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    `6 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadSimplePdf(filename: string, title: string, lines: string[]) {
  const contentLines = [
    "BT",
    "/F1 20 Tf",
    "50 780 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 11 Tf",
    "0 -32 Td",
    ...lines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "0 -18 Td"]),
    "ET",
  ];
  const stream = contentLines.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

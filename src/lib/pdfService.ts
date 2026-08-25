// ============================================================
// src/lib/pdfService.ts
// ⭐ LIFE'S ART ERP - PREMIUM COMPACT PDF
// ⭐ INDIGO + DARK MODE
// ⭐ TVA 20% + REMISE ROBUST
// ⭐ QR + TOTAL TTC COMPACT
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as QRCode from 'qrcode';

// ============================================================
// INTERFACES
// ============================================================

export interface OrderProduct {
  id?: number;
  name?: string;
  nom?: string;
  designation?: string;
  libelle?: string;
  produit_nom?: string;
  product_name?: string;
  quantity?: number;
  quantite?: number;
  qty?: number;
  price?: number;
  prix?: number;
  prix_vente?: number;
  prix_unitaire?: number;
  total?: number;
}

export interface Order {
  id: number;
  numero?: string;
  client_nom?: string;
  client_name?: string;
  client_telephone?: string;
  client_email?: string;
  client_address?: string;
  total_ht?: number;
  total?: number;
  total_ttc?: number;
  date_commande?: string;
  created_at?: string;
  createdAt?: string;
  date?: string;
  status: string;
  statut?: string;
  products: OrderProduct[];
  observation?: string;
  remise?: number;
}

export interface PDFOptions {
  order: Order;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companySiret?: string;
  companyImage?: string;
  companyTaxId?: string;
  companyRcs?: string;
  companyVatNumber?: string;
  paymentMethod?: string;
  paymentTerms?: string;
  dueDate?: string;
}

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  primary: [79, 70, 229], primaryDark: [67, 56, 202], primaryLight: [129, 140, 248],
  primarySoft: [238, 242, 255], secondary: [15, 23, 42], text: [15, 23, 42],
  textMuted: [100, 116, 139], textLight: [148, 163, 184], border: [203, 213, 225],
  background: [248, 250, 252], backgroundSoft: [238, 242, 255], white: [255, 255, 255],
  success: [16, 185, 129], warning: [245, 158, 11], danger: [239, 68, 68],
};

const DARK_COLORS = {
  primary: [129, 140, 248], primaryDark: [99, 102, 241], primaryLight: [165, 180, 252],
  primarySoft: [30, 41, 59], secondary: [248, 250, 252], text: [248, 250, 252],
  textMuted: [148, 163, 184], textLight: [100, 116, 139], border: [71, 85, 105],
  background: [15, 23, 42], backgroundSoft: [30, 41, 59], white: [248, 250, 252],
  success: [52, 211, 153], warning: [251, 191, 36], danger: [251, 113, 133],
};

type RGB = [number, number, number];

// ============================================================
// HELPERS
// ============================================================

const cleanText = (value: unknown): string => value == null ? '' : String(value).normalize('NFC').trim();
const num = (value: unknown): number => { const n = Number(value); return Number.isFinite(n) ? n : 0; };
const formatMoney = (amount: number): string => `${new Intl.NumberFormat('fr-FR', { useGrouping: true, maximumFractionDigits: 0 }).format(Math.max(0, num(amount))).replace(/\u202F/g, ' ')} Ar`;
const formatDate = (value: Date | string | undefined, format: 'short' | 'long' = 'short'): string => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return 'Date invalide';
  return d.toLocaleDateString('fr-FR', format === 'long' ? { day: '2-digit', month: '2-digit', year: 'numeric' } : undefined);
};
const getStatusLabel = (status?: string): string => {
  const value = cleanText(status);
  return ({ 'En attente': 'En attente', Confirmée: 'Confirmée', Livrée: 'Livrée', Annulée: 'Annulée' } as Record<string, string>)[value] || value || 'En attente';
};
const getProductName = (p: OrderProduct): string => cleanText(p.produit_nom || p.name || p.nom || p.designation || p.libelle || p.product_name || 'Produit');
const getProductQty = (p: OrderProduct): number => num(p.quantity ?? p.quantite ?? p.qty);
const getProductPrice = (p: OrderProduct): number => num(p.prix_unitaire ?? p.price ?? p.prix ?? p.prix_vente);
const getWindowApi = (): any => { try { return typeof window !== 'undefined' ? (window as any).api : undefined; } catch { return undefined; } };

// ============================================================
// IMAGE HELPERS
// ============================================================

const loadImageFromDatabase = async (imageId: string): Promise<string> => {
  const value = cleanText(imageId);
  if (!value) return '';
  if (value.startsWith('data:image') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('file://') || value.startsWith('local-image://') || value.startsWith('/')) return value;
  try {
    const api = getWindowApi();
    if (api?.images?.getUrl) {
      const result = await api.images.getUrl(value);
      if (result?.success && result.data) return result.data;
    }
  } catch (error) { console.warn('⚠️ loadImageFromDatabase:', error); }
  return value;
};

const imageToBase64 = async (imagePath: string): Promise<string | null> => {
  const value = cleanText(imagePath);
  if (!value) return null;
  try {
    if (value.startsWith('data:image')) return value;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('file://') || value.startsWith('local-image://')) {
      const api = getWindowApi();
      if (api?.images?.getImageAsBase64) {
        const result = await api.images.getImageAsBase64(value);
        if (result?.success && typeof result.data === 'string' && result.data.startsWith('data:image')) return result.data;
      }
    }
    return value;
  } catch (error) { console.error('❌ imageToBase64:', error); return value; }
};

// ============================================================
// GENERATE PDF - COMPACT VERSION
// ============================================================

export const generateOrderPDF = async (options: PDFOptions, isDark = false): Promise<jsPDF> => {
  const { order, clientName, clientEmail, clientPhone, clientAddress, companyName, companyLogo, companyAddress, companyPhone, companyEmail, companySiret, companyImage, companyTaxId, companyRcs, companyVatNumber, paymentMethod, paymentTerms, dueDate } = options;
  const C = isDark ? DARK_COLORS : COLORS;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const [pr, pg, pb] = C.primary;
  const [sr, sg, sb] = C.secondary;
  const [br, bg, bb] = C.border;
  const [wr, wg, wb] = C.white;
  const [bgr, bgg, bgb] = C.background;

  // NORMALIZE DATA
  const displayCompanyName = cleanText(companyName) || "Life's Art";
  const displayCompanyAddress = cleanText(companyAddress);
  const displayCompanyPhone = cleanText(companyPhone);
  const displayCompanyEmail = cleanText(companyEmail);
  const displayCompanySiret = cleanText(companySiret);
  const displayCompanyTaxId = cleanText(companyTaxId);
  const displayCompanyRcs = cleanText(companyRcs);
  const displayCompanyVatNumber = cleanText(companyVatNumber);
  const displayClientName = cleanText(clientName) || 'Client';
  const displayClientEmail = cleanText(clientEmail);
  const displayClientPhone = cleanText(clientPhone);
  const displayClientAddress = cleanText(clientAddress);
  const displayPaymentMethod = cleanText(paymentMethod) || 'Espèces';
  const displayPaymentTerms = cleanText(paymentTerms) || 'Sous 30 jours';
  const products = Array.isArray(order.products) ? order.products : [];

  // FACTURE NUMBER
  const orderId = cleanText(order.numero) || (order.id ? `FAC-${String(order.id).padStart(6, '0')}` : 'N/A');
  const orderDate = order.date_commande || order.created_at || order.createdAt || order.date || new Date().toISOString();
  const statusLabel = getStatusLabel(order.status || order.statut);

  // CALCUL HT / REMISE / TVA / TTC
  const calculatedHT = products.length ? products.reduce((sum, product) => sum + getProductQty(product) * getProductPrice(product), 0) : num(order.total_ht ?? order.total);
  const totalHT = Math.max(0, calculatedHT);
  const remiseAmount = Math.min(Math.max(0, num(order.remise)), totalHT);
  const totalHTAfterRemise = Math.max(0, totalHT - remiseAmount);
  const TVA_RATE = 0.2;
  const calculatedTTC = totalHTAfterRemise * (1 + TVA_RATE);
  const storedTTC = num(order.total_ttc);
  const isStoredTTCValid = storedTTC > 0 && Math.abs(storedTTC - calculatedTTC) < 1;
  const totalTTC = isStoredTTCValid ? storedTTC : calculatedTTC;
  const vatAmount = Math.max(0, totalTTC - totalHTAfterRemise);
  const vatRate = totalHTAfterRemise > 0 ? (vatAmount / totalHTAfterRemise) * 100 : 0;

  // DATE ÉCHÉANCE
  const dueDateObj = dueDate ? new Date(dueDate) : new Date(orderDate);
  if (!dueDate) dueDateObj.setDate(dueDateObj.getDate() + 30);
  const displayDueDate = formatDate(dueDateObj, 'long');

  // QR CODE
  let qrImageBase64 = '';
  try {
    const qrData = ['FACTURE', `N°: ${cleanText(orderId)}`, `Client: ${displayClientName}`, `Montant: ${formatMoney(totalTTC)}`, `Date: ${formatDate(orderDate)}`, `Echeance: ${displayDueDate}`, `Statut: ${statusLabel}`].join('\n');
    qrImageBase64 = await QRCode.toDataURL(qrData, { width: 120, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#4F46E5', light: isDark ? '#0F172A' : '#FFFFFF' } });
  } catch (error) { console.warn('⚠️ QR Code:', error); }

  // TOP BAR
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageWidth, 1.5, 'F');

  // LOGO
  const logoY = 6;
  const logoSize = 12;
  let imageData: string | null = null;
  const imageToUse = cleanText(companyImage) || cleanText(companyLogo);
  if (imageToUse) {
    try {
      imageData = await loadImageFromDatabase(imageToUse);
      if (imageData && (imageData.startsWith('file://') || imageData.startsWith('local-image://'))) imageData = await imageToBase64(imageData);
    } catch (error) { console.warn('⚠️ Logo:', error); }
  }
  if (imageData && imageData.startsWith('data:image')) {
    try { const isPng = imageData.includes('image/png'); doc.addImage(imageData, isPng ? 'PNG' : 'JPEG', margin, logoY, logoSize, logoSize); } catch (error) { console.warn('⚠️ Logo:', error); }
  }

  // COMPANY HEADER
  const logoRightX = margin + logoSize + 5;
  const textStartY = 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text(displayCompanyName, logoRightX, textStartY + 2);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(C.textMuted[0], C.textMuted[1], C.textMuted[2]);
  doc.text("Gestion d'entreprise", logoRightX, textStartY + 6);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  let coordY = textStartY + 10;
  if (displayCompanyAddress) { doc.text(`Adresse : ${displayCompanyAddress}`, logoRightX, coordY); coordY += 3.2; }
  if (displayCompanyPhone) { doc.text(`Tél : ${displayCompanyPhone}`, logoRightX, coordY); coordY += 3.2; }
  if (displayCompanyEmail) { doc.text(`Email : ${displayCompanyEmail}`, logoRightX, coordY); coordY += 3.2; }
  const separatorY = Math.max(coordY + 5, 32);
  doc.setDrawColor(br, bg, bb);
  doc.setLineWidth(0.15);
  doc.line(margin, separatorY, pageWidth - margin, separatorY);

  // FACTURE TITLE
  const titleY = separatorY + 5;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('FACTURE', margin, titleY);
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(0.25);
  doc.line(margin, titleY + 1.5, margin + 35, titleY + 1.5);

  // RIGHT INFO
  const rightX = pageWidth - margin;
  let startRightY = titleY - 4;
  const rightInfo = [
    { label: 'N° FACTURE', value: orderId },
    { label: 'DATE', value: formatDate(orderDate, 'long') },
    { label: 'ÉCHÉANCE', value: displayDueDate },
    { label: 'STATUT', value: statusLabel },
  ];
  doc.setFontSize(5.5);
  rightInfo.forEach(item => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(sr, sg, sb);
    doc.text(item.label, rightX, startRightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    doc.text(item.value, rightX, startRightY + 4, { align: 'right' });
    startRightY += 8;
  });

  // CLIENT / PAYMENT BOX
  const infoY = titleY + 16;
  const infoHeight = 20;
  doc.setDrawColor(br, bg, bb);
  doc.setLineWidth(0.15);
  doc.setFillColor(bgr, bgg, bgb);
  doc.roundedRect(margin, infoY, pageWidth - margin * 2, infoHeight, 1.5, 1.5, 'FD');

  // CLIENT
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('CLIENT', margin + 4, infoY + 5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.text[0], C.text[1], C.text[2]);
  let clientY = infoY + 9;
  doc.text(`Nom : ${displayClientName}`, margin + 4, clientY);
  clientY += 4.2;
  if (displayClientAddress) { doc.text(`Adr : ${displayClientAddress}`, margin + 4, clientY); clientY += 4.2; }
  if (displayClientEmail) { doc.text(`Email : ${displayClientEmail}`, margin + 4, clientY); clientY += 4.2; }
  if (displayClientPhone) { doc.text(`Tél : ${displayClientPhone}`, margin + 4, clientY); }

  // PAYMENT
  const paymentX = pageWidth - margin - 80;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('PAIEMENT', paymentX, infoY + 5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.text[0], C.text[1], C.text[2]);
  let paymentY = infoY + 9;
  doc.text(`Mode : ${displayPaymentMethod}`, paymentX, paymentY);
  paymentY += 4.2;
  doc.text(`Cond. : ${displayPaymentTerms}`, paymentX, paymentY);
  paymentY += 4.2;
  doc.text(`Échéance : ${displayDueDate}`, paymentX, paymentY);

  // PRODUCTS TABLE
  const tableStartY = infoY + 24;
  const tableData: any[][] = products.length ? products.map((product, index) => {
    const name = getProductName(product);
    const qty = getProductQty(product);
    const price = getProductPrice(product);
    const total = qty * price;
    return [index + 1, name, qty.toString(), formatMoney(price), formatMoney(total)];
  }) : [['-', 'Aucun produit', '-', '-', '-']];

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'DÉSIGNATION', 'QTÉ', 'P.U.', 'TOTAL']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [pr, pg, pb] as RGB, textColor: [wr, wg, wb] as RGB, fontStyle: 'bold', halign: 'center', fontSize: 7, cellPadding: 2.5, lineWidth: 0.1, lineColor: [pr, pg, pb] as RGB },
    bodyStyles: { textColor: [C.text[0], C.text[1], C.text[2]] as RGB, fontSize: 6, cellPadding: 2, lineWidth: 0.08, lineColor: [br, bg, bb] as RGB },
    columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 12, halign: 'center' }, 3: { cellWidth: 28, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' } },
    alternateRowStyles: { fillColor: isDark ? [30, 41, 59] : [248, 250, 252] },
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - margin * 2,
    styles: { overflow: 'linebreak', valign: 'middle' },
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || tableStartY + 30;

  // TOTALS AREA
  let totalsY = finalTableY + 5;
  if (totalsY > pageHeight - 68) {
    doc.addPage();
    totalsY = 20;
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, pageWidth, 1.5, 'F');
  }

  const totalsBlockX = margin;
  const totalsBlockWidth = pageWidth - margin * 2;
  const totalsBlockHeight = 35;
  const qrColumnWidth = 72;

  // Bloc background
  doc.setFillColor(isDark ? 15 : 255, isDark ? 23 : 255, isDark ? 42 : 255);
  doc.setDrawColor(br, bg, bb);
  doc.setLineWidth(0.10);
  doc.rect(totalsBlockX, totalsY, totalsBlockWidth, totalsBlockHeight, 'FD');

  // Vertical separator
  const separatorX = totalsBlockX + qrColumnWidth;
  doc.setDrawColor(br, bg, bb);
  doc.setLineWidth(0.08);
  doc.line(separatorX, totalsY, separatorX, totalsY + totalsBlockHeight);

  // QR CODE
  const qrSize = 24;
  const qrX = totalsBlockX + (qrColumnWidth - qrSize) / 2;
  const qrY = totalsY + 4;
  if (qrImageBase64) {
    try {
      doc.addImage(qrImageBase64, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFontSize(4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(C.textLight[0], C.textLight[1], C.textLight[2]);
      doc.text('SCAN', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });
    } catch (error) { console.warn('⚠️ QR PDF:', error); }
  }

  // TOTALS
  const totalsX = separatorX + 10;
  const totalsRightX = pageWidth - margin - 4;
  let currentY = totalsY + 7;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.text[0], C.text[1], C.text[2]);

  // SOUS-TOTAL
  doc.text('Sous-total HT', totalsX, currentY);
  doc.text(formatMoney(totalHT), totalsRightX, currentY, { align: 'right' });
  currentY += 5;

  // REMISE
  if (remiseAmount > 0) {
    doc.text('Remise', totalsX, currentY);
    doc.setTextColor(C.danger[0], C.danger[1], C.danger[2]);
    doc.text(`- ${formatMoney(remiseAmount)}`, totalsRightX, currentY, { align: 'right' });
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    currentY += 5;
    doc.text('Net HT', totalsX, currentY);
    doc.text(formatMoney(totalHTAfterRemise), totalsRightX, currentY, { align: 'right' });
    currentY += 5;
  }

  // TVA
  doc.text(`TVA (${vatRate.toFixed(0)}%)`, totalsX, currentY);
  doc.text(formatMoney(vatAmount), totalsRightX, currentY, { align: 'right' });
  currentY += 6;

  // TOTAL LINE
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(0.15);
  doc.line(totalsX, currentY - 2, totalsRightX, currentY - 2);

  // TOTAL TTC
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('TOTAL TTC', totalsX, currentY + 5);
  doc.text(formatMoney(totalTTC), totalsRightX, currentY + 5, { align: 'right' });

  // FOOTER AREA
  const footerY = totalsY + totalsBlockHeight + 1;

  // Footer separator
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(0.12);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // THANK YOU
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('Merci de votre confiance !', pageWidth / 2, footerY + 5, { align: 'center' });

  // FOOTER COMPANY INFORMATION
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.textLight[0], C.textLight[1], C.textLight[2]);
  const footerParts = [
    `© ${new Date().getFullYear()} ${displayCompanyName}`,
    displayCompanySiret ? `SIRET: ${displayCompanySiret}` : '',
    displayCompanyTaxId ? `NIF: ${displayCompanyTaxId}` : '',
    displayCompanyRcs ? `RCS: ${displayCompanyRcs}` : '',
    displayCompanyVatNumber ? `TVA: ${displayCompanyVatNumber}` : '',
    displayCompanyPhone ? `Tél: ${displayCompanyPhone}` : '',
    displayCompanyEmail ? `Email: ${displayCompanyEmail}` : '',
  ].filter(Boolean);
  const footerText = footerParts.join(' | ');
  const footerMaxWidth = pageWidth - margin * 2;
  const footerLines = doc.splitTextToSize(footerText, footerMaxWidth);
  doc.text(footerLines, pageWidth / 2, footerY + 10, { align: 'center', maxWidth: footerMaxWidth });

  // SMALL PAGE NUMBER
  doc.setFontSize(4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.textLight[0], C.textLight[1], C.textLight[2]);
  doc.text('Page 1', pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc;
};

// ============================================================
// DOWNLOAD PDF
// ============================================================

export const downloadPDF = async (options: PDFOptions, isDark = false) => {
  try {
    const doc = await generateOrderPDF(options, isDark);
    const orderId = cleanText(options.order.numero) || (options.order.id ? `FAC-${String(options.order.id).padStart(6, '0')}` : 'temp');
    const fileName = `facture_${orderId}.pdf`;
    const pdfData = doc.output('arraybuffer');
    const api = getWindowApi();
    if (!api?.utils?.saveFile) return { success: false, error: 'API saveFile indisponible.' };
    const result = await api.utils.saveFile(pdfData, fileName);
    if (result?.canceled) return { success: false, canceled: true };
    if (!result?.success) return { success: false, error: result?.error || 'Erreur lors de la sauvegarde du fichier.' };
    return { success: true, filePath: result.filePath };
  } catch (error: any) {
    console.error('❌ Erreur génération PDF:', error);
    return { success: false, error: error?.message || 'Erreur PDF inconnue.' };
  }
};

// ============================================================
// PRINT PDF
// ============================================================

export const printPDF = async (options: PDFOptions, isDark = false) => {
  let url = '';
  try {
    const doc = await generateOrderPDF(options, isDark);
    const blob = doc.output('blob');
    url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      URL.revokeObjectURL(url);
      return { success: false, error: 'Impossible d’ouvrir la fenêtre d’impression.' };
    }
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (error) { console.warn('⚠️ Print:', error); }
      setTimeout(() => {
        try { printWindow.close(); } catch {}
        try { URL.revokeObjectURL(url); } catch {}
      }, 1500);
    }, 700);
    return { success: true };
  } catch (error: any) {
    if (url) { try { URL.revokeObjectURL(url); } catch {} }
    console.error('❌ Erreur impression PDF:', error);
    return { success: false, error: error?.message || 'Erreur impression PDF.' };
  }
};

// ============================================================
// GET PDF BLOB
// ============================================================

export const getPDFBlob = async (options: PDFOptions, isDark = false): Promise<Blob> => {
  const doc = await generateOrderPDF(options, isDark);
  return doc.output('blob');
};

// ============================================================
// GET PDF BASE64
// ============================================================

export const getPDFBase64 = async (options: PDFOptions, isDark = false): Promise<string> => {
  const doc = await generateOrderPDF(options, isDark);
  return doc.output('datauristring');
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  generateOrderPDF,
  downloadPDF,
  printPDF,
  getPDFBlob,
  getPDFBase64,
};
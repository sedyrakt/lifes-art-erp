// ============================================================
// src/lib/ventesPDFService.ts - VERSION FINALE (A4)
// ⭐ DESIGN MITOVY AMIN'NY FACTURE (INDIGO THEME)
// ⭐ FIX: TEXTE AO ANATIN'NY TABLEAU = FOTSY & BACKGROUND MAIZINA
// ⭐ FIX: SOUS-TOTAL, TVA & TOTAL TTC = MAINTY (NOIR)
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as QRCode from 'qrcode';

// ============================================================
// INTERFACES
// ============================================================

export interface VenteProduct {
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

export interface Vente {
  id: number;
  numero?: string;
  reference?: string;
  client_nom?: string;
  client_name?: string;
  client_telephone?: string;
  client_email?: string;
  client_address?: string;
  total_ht?: number;
  total?: number;
  total_ttc?: number;
  date_devis?: string;
  date_facture?: string;
  created_at?: string;
  createdAt?: string;
  date?: string;
  status: string;
  statut?: string;
  products: VenteProduct[];
  observation?: string;
  remise?: number;
}

export interface VentesPDFOptions {
  vente: Vente;
  type: 'devis' | 'factures';
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
// ⭐ PALETTE DE COULEURS - INDIGO + DARK (#0F172A)
// ============================================================

const COLORS = {
  primary: [79, 70, 229],       // #4F46E5 - Indigo principal
  primaryDark: [67, 56, 202],   // #4338CA - Indigo foncé
  primaryLight: [129, 140, 248], // #818CF8 - Indigo clair
  primarySoft: [238, 242, 255],  // #EEF2FF - Indigo très clair
  secondary: [15, 23, 42],       // #0F172A - Noir (typo)
  text: [15, 23, 42],            // #0F172A - Texte principal
  textMuted: [100, 116, 139],    // #64748B - Texte secondaire
  textLight: [148, 163, 184],    // #94A3B8 - Texte léger
  border: [156, 163, 175],       // #9CA3AF - Border gray-400
  tableText: [75, 85, 99],       // #4B5563 - Table text gray-600
  background: [248, 250, 252],   // #F8FAFC - Fond
  backgroundSoft: [238, 242, 255], // #EEF2FF - Fond indigo très clair
  white: [255, 255, 255],        // #FFFFFF - Blanc
  success: [16, 185, 129],       // #10B981 - Succès
  warning: [245, 158, 11],       // #F59E0B - Warning
  danger: [239, 68, 68],         // #EF4444 - Danger
};

// ⭐ DARK THEME COLORS (#0F172A)
const DARK_COLORS = {
  primary: [129, 140, 248],      // #818CF8 - Indigo clair
  primaryDark: [99, 102, 241],   // #6366F1 - Indigo
  primaryLight: [165, 180, 252], // #A5B4FC - Indigo très clair
  primarySoft: [30, 41, 59],     // #1E293B - Fond indigo sombre (slate-800)
  secondary: [248, 250, 252],    // #F8FAFC - Texte clair
  text: [248, 250, 252],         // #F8FAFC - Texte principal
  textMuted: [148, 163, 184],    // #94A3B8 - Texte secondaire
  textLight: [100, 116, 139],    // #64748B - Texte léger
  border: [75, 85, 99],          // #4B5563 - Border gray-600 (dark mode)
  tableText: [209, 213, 219],    // #D1D5DB - Table text gray-300 (dark mode)
  background: [15, 23, 42],      // #0F172A - Fond principal (slate-900)
  backgroundSoft: [30, 41, 59],  // #1E293B - Fond secondaire (slate-800)
  white: [248, 250, 252],        // #F8FAFC - Blanc (texte clair)
  success: [52, 211, 153],       // #34D399 - Succès
  warning: [251, 191, 36],       // #FBBF24 - Warning
  danger: [251, 113, 133],       // #FB7185 - Danger
};

const formatMoney = (amount: number): string => {
  if (!amount && amount !== 0) return '0 Ar';
  return new Intl.NumberFormat('fr-FR', { useGrouping: true, maximumFractionDigits: 0 })
    .format(amount).replace(/\u202F/g, ' ') + ' Ar';
};

const formatDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Date invalide';
  return format === 'short' ? d.toLocaleDateString('fr-FR') : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const cleanText = (text: string): string => { if (!text) return ''; return text.normalize('NFC').trim(); };
const cleanForQR = (text: string): string => { if (!text) return ''; return text.normalize('NFC').trim(); };

// ============================================================
// ⭐ FONCTION POUR CHARGER L'IMAGE (VIA IPC - Robuste)
// ============================================================

const loadImageFromDatabase = async (imageId: string): Promise<string> => {
  if (!imageId) return '';
  if (imageId.startsWith('data:image') || imageId.startsWith('http://') ||
      imageId.startsWith('https://') || imageId.startsWith('file://') ||
      imageId.startsWith('local-image://') || imageId.startsWith('/')) {
    return imageId;
  }
  try {
    if (window?.api?.images?.getUrl) {
      const result = await window.api.images.getUrl(imageId);
      if (result?.success && result.data) return result.data;
    }
  } catch (error) { console.warn('⚠️ loadImageFromDatabase: Erreur IPC', error); }
  return imageId;
};

const imageToBase64 = async (imagePath: string): Promise<string | null> => {
  try {
    if (imagePath.startsWith('data:image')) return imagePath;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('file://') || imagePath.startsWith('local-image://')) {
      if (window?.api?.images?.getImageAsBase64) {
        const result = await window.api.images.getImageAsBase64(imagePath);
        if (result?.success && result.data?.startsWith('data:image')) return result.data;
      }
    }
    return imagePath;
  } catch (error) { console.error('❌ imageToBase64:', error); return imagePath; }
};

// ============================================================
// ⭐ GENERATE VENTE PDF - PREMIUM (A4)
// ============================================================

export const generateVentePDF = async (options: VentesPDFOptions, isDark: boolean = false): Promise<jsPDF> => {
  const {
    vente,
    type,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    companyName,
    companyLogo,
    companyAddress,
    companyPhone,
    companyEmail,
    companySiret,
    companyImage,
    companyTaxId,
    companyRcs,
    companyVatNumber,
    paymentMethod,
    paymentTerms,
    dueDate
  } = options;

  // ⭐ SAFIDY THEME
  const C = isDark ? DARK_COLORS : COLORS;

  // ⭐ FIX: Atambatra tsara ny anarana (Life's Art no default)
  const displayCompanyName = cleanText(companyName || "Life's Art");
  const displayCompanyAddress = cleanText(companyAddress || '');
  const displayCompanyPhone = cleanText(companyPhone || '');
  const displayCompanyEmail = cleanText(companyEmail || '');
  const displayCompanySiret = cleanText(companySiret || '');
  const displayCompanyTaxId = cleanText(companyTaxId || '');
  const displayCompanyRcs = cleanText(companyRcs || '');
  const displayCompanyVatNumber = cleanText(companyVatNumber || '');
  const displayPaymentMethod = cleanText(paymentMethod || 'Espèces');
  const displayPaymentTerms = cleanText(paymentTerms || 'Sous 30 jours');
  const displayClientName = cleanText(clientName || 'Client');
  const displayClientEmail = cleanText(clientEmail || '');
  const displayClientPhone = cleanText(clientPhone || '');
  const displayClientAddress = cleanText(clientAddress || '');

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;

  const [pr, pg, pb] = C.primary;
  const [sr, sg, sb] = C.secondary;
  const [br, bg, bb] = C.border;
  const [wr, wg, wb] = C.white;
  const [bgr, bgg, bgb] = C.background;
  const [ttr, ttg, ttb] = C.tableText;

  const orderId = type === 'devis'
    ? (vente.reference || vente.numero || (vente.id ? `DEV-${String(vente.id).padStart(6, '0')}` : 'N/A'))
    : (vente.reference || vente.numero || (vente.id ? `FAC-${String(vente.id).padStart(6, '0')}` : 'N/A'));

  const titleText = type === 'devis' ? 'DEVIS' : 'FACTURE';

  // ============================================================
  // ⭐ CALCUL TOTAL HT / TTC / TVA (TVA 20%)
  // ============================================================
  const products = Array.isArray(vente.products) ? vente.products : [];

  let totalHT = 0;
  if (products.length > 0) {
    totalHT = products.reduce((sum, p: any) => {
      const qty = Number(p.quantity || p.quantite || p.qty || 0);
      const price = Number(p.price || p.prix || p.prix_vente || p.prix_unitaire || 0);
      return sum + (qty * price);
    }, 0);
  } else {
    totalHT = vente.total_ht || vente.total || 0;
  }

  // ⭐ FIX: Raha misy remise
  const remiseAmount = Number(vente.remise || 0);
  const totalHTAfterRemise = totalHT - remiseAmount;

  // ⭐ FIX: Total TTC - Raha diso ny total_ttc dia calculer TVA 20%
  const totalTTC = (vente.total_ttc && vente.total_ttc > totalHTAfterRemise) 
    ? vente.total_ttc 
    : Math.round(totalHTAfterRemise * 1.2 * 100) / 100; // TVA 20%

  // ⭐ FIX: Calcul TVA - Tsy mety ny négatif
  const vatAmount = Math.max(0, Math.round((totalTTC - totalHTAfterRemise) * 100) / 100);
  const vatRate = totalHTAfterRemise > 0 
    ? Math.round(((totalTTC - totalHTAfterRemise) / totalHTAfterRemise) * 100 * 100) / 100 
    : 0;

  const orderDate = vente.date_devis || vente.date_facture || vente.created_at || new Date().toISOString();
  const dueDateObj = dueDate ? new Date(dueDate) : new Date(orderDate);
  if (!dueDate) dueDateObj.setDate(dueDateObj.getDate() + 30);
  const displayDueDate = formatDate(dueDateObj, 'long');

  // ============================================================
  // ⭐ QR CODE
  // ============================================================
  let qrImageBase64 = '';
  try {
    const qrData = [
      `${titleText}`,
      `N°: ${cleanForQR(orderId)}`,
      `Client: ${cleanForQR(displayClientName)}`,
      `Montant: ${formatMoney(totalTTC)}`,
      `Date: ${formatDate(orderDate, 'short')}`,
      `Echeance: ${cleanForQR(displayDueDate)}`
    ].filter(line => line !== '').join('\n');
    qrImageBase64 = await QRCode.toDataURL(qrData, { 
      width: 120, 
      margin: 2, 
      errorCorrectionLevel: 'H', 
      color: { 
        dark: '#4F46E5', // Indigo
        light: isDark ? '#0F172A' : '#FFFFFF' 
      } 
    });
  } catch (_) {}

  // ============================================================
  // ⭐ EN-TÊTE PREMIUM (Logo + Company Info)
  // ============================================================
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageWidth, 1.5, 'F');

  let logoY = 6;
  let logoSize = 12;
  let imageToUse = companyImage || companyLogo || '';
  let imageData: string | null = null;

  if (imageToUse && typeof imageToUse === 'string' && imageToUse.length > 0) {
    try {
      let cleanImage = imageToUse.trim();
      if (cleanImage.startsWith('local-image://') || cleanImage.startsWith('file://') ||
          cleanImage.startsWith('data:image') || cleanImage.startsWith('http://') ||
          cleanImage.startsWith('https://') || cleanImage.startsWith('/')) {
        imageData = cleanImage;
      } else {
        const loadedImage = await loadImageFromDatabase(cleanImage);
        if (loadedImage) imageData = loadedImage;
      }
    } catch (_) {}
  }

  if (imageData) {
    try {
      let finalImageData = imageData;
      if (imageData.startsWith('file://') || imageData.startsWith('local-image://')) {
        const base64Result = await imageToBase64(imageData);
        if (base64Result) finalImageData = base64Result;
      }
      if (finalImageData.startsWith('data:image')) {
        const isPng = finalImageData.includes('image/png');
        doc.addImage(finalImageData, isPng ? 'PNG' : 'JPEG', margin, logoY, logoSize, logoSize);
        console.log('✅ Logo ajouté au PDF');
      }
    } catch (_) {
      console.warn('⚠️ Impossible d\'ajouter le logo au PDF');
    }
  }

  const logoRightX = margin + logoSize + 5;
  const textStartY = 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text(displayCompanyName, logoRightX, textStartY + 2);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(C.textMuted[0], C.textMuted[1], C.textMuted[2]);
  doc.text('Gestion d\'entreprise', logoRightX, textStartY + 6);

  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.textMuted[0], C.textMuted[1], C.textMuted[2]);
  let coordY = textStartY + 10;
  const coordX = logoRightX;
  if (displayCompanyAddress) { doc.text(`Adresse : ${displayCompanyAddress}`, coordX, coordY); coordY += 3.2; }
  if (displayCompanyPhone) { doc.text(`Tél : ${displayCompanyPhone}`, coordX, coordY); coordY += 3.2; }
  if (displayCompanyEmail) { doc.text(`Email : ${displayCompanyEmail}`, coordX, coordY); coordY += 3.2; }

  const separatorY = Math.max(coordY + 5, 32);
  doc.setDrawColor(br, bg, bb);
  doc.line(margin, separatorY, pageWidth - margin, separatorY);

  // ============================================================
  // ⭐ TITRE & ORDER INFO
  // ============================================================
  const titleY = separatorY + 5;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text(titleText, margin, titleY);
  doc.setDrawColor(pr, pg, pb);
  doc.line(margin, titleY + 1.5, margin + 35, titleY + 1.5);

  const rightX = pageWidth - margin;
  let startRightY = titleY - 4;
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  const rightInfo = [
    { label: 'N°', value: orderId },
    { label: 'DATE', value: formatDate(orderDate, 'long') },
    { label: 'ÉCHÉANCE', value: displayDueDate }
  ];
  rightInfo.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(sr, sg, sb);
    doc.text(item.label, rightX, startRightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    doc.text(item.value, rightX, startRightY + 4, { align: 'right' });
    startRightY += 8;
  });

  // ============================================================
  // ⭐ INFORMATIONS CLIENT & PAIEMENT
  // ============================================================
  const infoY = titleY + 16;
  doc.setDrawColor(br, bg, bb);
  doc.setFillColor(bgr, bgg, bgb);
  doc.roundedRect(margin, infoY, pageWidth - (margin * 2), 20, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('CLIENT', margin + 4, infoY + 5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.text[0], C.text[1], C.text[2]);
  let cInfoY = infoY + 9;
  doc.text(`Nom : ${displayClientName}`, margin + 4, cInfoY);
  cInfoY += 4.2;
  if (displayClientAddress) { doc.text(`Adr : ${displayClientAddress}`, margin + 4, cInfoY); cInfoY += 4.2; }
  if (displayClientEmail) { doc.text(`Email : ${displayClientEmail}`, margin + 4, cInfoY); cInfoY += 4.2; }
  if (displayClientPhone) { doc.text(`Tél : ${displayClientPhone}`, margin + 4, cInfoY); }

  const paymentX = pageWidth - margin - 80;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('PAIEMENT', paymentX, infoY + 5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.text[0], C.text[1], C.text[2]);
  let pInfoY = infoY + 9;
  doc.text(`Mode : ${displayPaymentMethod}`, paymentX, pInfoY);
  pInfoY += 4.2;
  doc.text(`Cond. : ${displayPaymentTerms}`, paymentX, pInfoY);
  pInfoY += 4.2;
  doc.text(`Échéance : ${displayDueDate}`, paymentX, pInfoY);

  // ============================================================
  // ⭐ TABLEAU DES PRODUITS (TEXTE FOTSY & BACKGROUND MAIZINA)
  // ============================================================
  const tableStartY = infoY + 24;
  let tableData: any[][] = [];

  if (!products || products.length === 0) {
    tableData = [['-', 'Aucun produit', '-', '-', '-']];
  } else {
    tableData = products.map((item: any, index: number) => {
      const prodName = cleanText(
        item.produit_nom ||
        item.name ||
        item.nom ||
        item.designation ||
        item.libelle ||
        item.product_name ||
        'Produit'
      );
      const prodQty = Number(item.quantity || item.quantite || item.qty || 0);
      const prodPrice = Number(
        item.prix_unitaire ||
        item.price ||
        item.prix ||
        item.prix_vente ||
        0
      );
      const total = prodQty * prodPrice;
      return [index + 1, prodName, prodQty.toString(), formatMoney(prodPrice), formatMoney(total)];
    });
  }

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'DÉSIGNATION', 'QTÉ', 'P.U.', 'TOTAL']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [pr, pg, pb],
      textColor: [wr, wg, wb],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7,
      cellPadding: 2.5,
      lineWidth: 0.1,
      lineColor: [pr, pg, pb]
    },
    bodyStyles: {
      // ⭐ FIX: FOTSY NY TEXTE
      textColor: [255, 255, 255], 
      fontSize: 6,
      cellPadding: 2,
      lineWidth: 0.15, 
      lineColor: [br, bg, bb],
      // ⭐ FIX: MAIZINA NY BACKGROUND
      fillColor: [15, 23, 42] // Slate-900 (Mainty)
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' }
    },
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - (margin * 2),
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || tableStartY + 30;

  // ============================================================
  // ⭐ TOTAUX & PIED DU TABLEAU (MAINTY NY TEXTE)
  // ============================================================
  const totalsY = finalTableY + 5;
  const lineX = pageWidth - 80;

  // ⭐ FIX: Ataovy mainty hatrany ny texte ao amin'ny Sous-total sy TVA
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42); // NOIR #0F172A
  doc.text('Sous-total HT', lineX, totalsY);
  doc.text(formatMoney(totalHTAfterRemise), pageWidth - margin, totalsY, { align: 'right' });
  doc.text(`TVA (${vatRate}%)`, lineX, totalsY + 5);
  doc.text(formatMoney(vatAmount), pageWidth - margin, totalsY + 5, { align: 'right' });
  
  doc.setDrawColor(pr, pg, pb);
  doc.line(lineX, totalsY + 7, pageWidth - margin, totalsY + 7);
  
  // ⭐ FIX: Ataovy mainty koa ny TOTAL TTC mba ho hita tsara
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // NOIR #0F172A
  doc.text('TOTAL TTC', lineX, totalsY + 14);
  doc.text(formatMoney(totalTTC), pageWidth - margin, totalsY + 14, { align: 'right' });

  // ⭐ QR CODE
  const qrSize = 12;
  const qrX = pageWidth - margin - qrSize;
  const qrY = totalsY + 20;

  if (qrImageBase64) {
    try {
      doc.addImage(qrImageBase64, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFontSize(4);
      doc.setTextColor(C.textLight[0], C.textLight[1], C.textLight[2]);
      doc.text('Scan', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });
    } catch (_) {}
  }

  // ============================================================
  // ⭐ FOOTER (AVEC SIRET, NIF, RCS, TVA)
  // ============================================================
  const infoYEnd = totalsY + 38;
  doc.setDrawColor(pr, pg, pb);
  doc.line(margin, infoYEnd, pageWidth - margin, infoYEnd);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pr, pg, pb);
  doc.text('Merci de votre confiance !', pageWidth / 2, infoYEnd + 5, { align: 'center' });

  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.textLight[0], C.textLight[1], C.textLight[2]);

  let footerText = `© ${new Date().getFullYear()} ${displayCompanyName}`;
  if (displayCompanySiret) footerText += ` | SIRET: ${displayCompanySiret}`;
  if (displayCompanyTaxId) footerText += ` | NIF: ${displayCompanyTaxId}`;
  if (displayCompanyRcs) footerText += ` | RCS: ${displayCompanyRcs}`;
  if (displayCompanyVatNumber) footerText += ` | TVA: ${displayCompanyVatNumber}`;
  if (displayCompanyPhone) footerText += ` | Tél: ${displayCompanyPhone}`;
  if (displayCompanyEmail) footerText += ` | Email: ${displayCompanyEmail}`;
  doc.text(footerText, margin, infoYEnd + 10);

  return doc;
};

// ============================================================
// ⭐ EXPORT FUNCTIONS
// ============================================================

export const downloadVentePDF = async (options: VentesPDFOptions, isDark: boolean = false) => {
  try {
    const doc = await generateVentePDF(options, isDark);
    const orderId = options.type === 'devis'
      ? (options.vente.reference || options.vente.numero || `DEV-${String(options.vente.id).padStart(6, '0')}`)
      : (options.vente.reference || options.vente.numero || `FAC-${String(options.vente.id).padStart(6, '0')}`);
    const defaultFileName = `${options.type === 'devis' ? 'devis' : 'facture'}_${orderId}.pdf`;
    const pdfData = doc.output('arraybuffer');

    const result = await window.api.utils.saveFile(pdfData, defaultFileName);

    if (result && result.canceled) return { success: false, canceled: true };
    if (!result || !result.success) return { success: false, error: result?.error || 'Erreur lors de la sauvegarde du fichier' };
    return { success: true, filePath: result.filePath };
  } catch (error: any) {
    console.error('❌ Erreur génération PDF:', error);
    return { success: false, error: error.message };
  }
};

export const printVentePDF = async (options: VentesPDFOptions, isDark: boolean = false) => {
  try {
    const doc = await generateVentePDF(options, isDark);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erreur impression PDF:', error);
    return { success: false, error: error.message };
  }
};

export const getVentePDFBlob = async (options: VentesPDFOptions, isDark: boolean = false): Promise<Blob> => {
  const doc = await generateVentePDF(options, isDark);
  return doc.output('blob');
};

export const getVentePDFBase64 = async (options: VentesPDFOptions, isDark: boolean = false): Promise<string> => {
  const doc = await generateVentePDF(options, isDark);
  return doc.output('datauristring');
};

export default { generateVentePDF, downloadVentePDF, printVentePDF, getVentePDFBlob, getVentePDFBase64 };
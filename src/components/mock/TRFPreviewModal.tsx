import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Check,
  Copy,
  ShieldCheck,
  Award,
  FileText,
  User,
  Calendar,
  Building,
  Hash,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { FullMockExamResult } from '../../types/ielts';
import { formatBand } from '../../utils/scoring';

interface TRFPreviewModalProps {
  result: FullMockExamResult;
  isOpen: boolean;
  onClose: () => void;
}

export const TRFPreviewModal: React.FC<TRFPreviewModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const [copiedTRF, setCopiedTRF] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate authentic TRF reference number based on date, center, candidate ID
  const trfNumber = `26IA008${result.candidateNumber || '489201'}${result.candidateName.slice(0, 3).toUpperCase()}001A`;

  // Copy TRF Number
  const handleCopyTRF = () => {
    navigator.clipboard.writeText(trfNumber);
    setCopiedTRF(true);
    setTimeout(() => setCopiedTRF(false), 2000);
  };

  // Client-Side Native PDF Generation using jsPDF
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 15;

      // Outer Security Border
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.8);
      doc.rect(margin, margin, pageWidth - margin * 2, 267);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(margin + 2, margin + 2, pageWidth - margin * 2 - 4, 263);

      // Top Security Header Strip
      doc.setFillColor(15, 23, 42);
      doc.rect(margin + 2, margin + 2, pageWidth - margin * 2 - 4, 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(
        'CAMBRIDGE ASSESSMENT ENGLISH  ·  BRITISH COUNCIL  ·  IDP: IELTS AUSTRALIA',
        pageWidth / 2,
        margin + 9,
        { align: 'center' }
      );

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'INTERNATIONAL ENGLISH LANGUAGE TESTING SYSTEM',
        pageWidth / 2,
        margin + 15,
        { align: 'center' }
      );

      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('TEST REPORT FORM', margin + 8, margin + 30);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 78, 216);
      doc.text(`ACADEMIC MODULE`, pageWidth - margin - 8, margin + 30, { align: 'right' });

      // TRF Number Banner
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin + 8, margin + 34, pageWidth - margin * 2 - 16, 9, 'FD');

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TEST REPORT FORM NUMBER:', margin + 12, margin + 40);

      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(trfNumber, margin + 65, margin + 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`DATE: ${result.date}`, pageWidth - margin - 12, margin + 40, { align: 'right' });

      // Candidate Information Grid
      const infoTop = margin + 48;

      // Candidate Photo Box
      doc.setDrawColor(148, 163, 184);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin + 8, infoTop, 35, 45, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('CANDIDATE', margin + 25.5, infoTop + 20, { align: 'center' });
      doc.text('PHOTOGRAPH', margin + 25.5, infoTop + 24, { align: 'center' });

      doc.setFontSize(6);
      doc.setTextColor(220, 38, 38);
      doc.text('AUTHENTICATED', margin + 25.5, infoTop + 38, { align: 'center' });

      // Info Fields
      const fieldX = margin + 50;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text('Family Name:', fieldX, infoTop + 6);
      doc.text('First Name(s):', fieldX, infoTop + 14);
      doc.text('Candidate ID:', fieldX, infoTop + 22);
      doc.text('Centre Number:', fieldX, infoTop + 30);
      doc.text('Examination Venue:', fieldX, infoTop + 38);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      const nameParts = result.candidateName.split(' ');
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : 'CANDIDATE';
      const firstNames = nameParts.slice(0, -1).join(' ').toUpperCase() || result.candidateName.toUpperCase();

      doc.text(lastName, fieldX + 35, infoTop + 6);
      doc.text(firstNames, fieldX + 35, infoTop + 14);
      doc.setFont('courier', 'bold');
      doc.text(result.candidateNumber || '489201', fieldX + 35, infoTop + 22);
      doc.setFont('helvetica', 'bold');
      doc.text(result.testCenterCode.split(' - ')[0] || 'IA008', fieldX + 35, infoTop + 30);
      doc.setFontSize(8);
      doc.text(result.testCenterCode || 'IA008 - International Assessment Center', fieldX + 35, infoTop + 38);

      // Section Divider
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(margin + 8, infoTop + 52, pageWidth - margin - 8, infoTop + 52);

      // TEST RESULTS SECTION
      const resultsTop = infoTop + 60;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('TEST RESULTS', margin + 8, resultsTop);

      // 4-Skill Table Header
      const tableX = margin + 8;
      const tableW = pageWidth - margin * 2 - 16;
      const colW = tableW / 5;

      doc.setFillColor(241, 245, 249);
      doc.rect(tableX, resultsTop + 4, tableW, 9, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(tableX, resultsTop + 4, tableW, 28);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Listening', tableX + colW * 0.5, resultsTop + 10, { align: 'center' });
      doc.text('Reading', tableX + colW * 1.5, resultsTop + 10, { align: 'center' });
      doc.text('Writing', tableX + colW * 2.5, resultsTop + 10, { align: 'center' });
      doc.text('Speaking', tableX + colW * 3.5, resultsTop + 10, { align: 'center' });

      doc.setFillColor(29, 78, 216);
      doc.rect(tableX + colW * 4, resultsTop + 4, colW, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('OVERALL BAND', tableX + colW * 4.5, resultsTop + 10, { align: 'center' });

      // Table Scores Row
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);

      doc.text(formatBand(result.listeningBand), tableX + colW * 0.5, resultsTop + 24, { align: 'center' });
      doc.text(formatBand(result.readingBand), tableX + colW * 1.5, resultsTop + 24, { align: 'center' });
      doc.text(formatBand(result.writingBand), tableX + colW * 2.5, resultsTop + 24, { align: 'center' });
      doc.text(formatBand(result.speakingBand), tableX + colW * 3.5, resultsTop + 24, { align: 'center' });

      // Prominent Overall Band
      doc.setFontSize(18);
      doc.setTextColor(29, 78, 216);
      doc.text(formatBand(result.overallBand), tableX + colW * 4.5, resultsTop + 24, { align: 'center' });

      // CEFR Descriptor Box
      const cefrTop = resultsTop + 38;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin + 8, cefrTop, tableW, 14, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`CEFR Level: ${result.cefrLevel}`, margin + 14, cefrTop + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Competent operational command with occasional inaccuracies and misunderstandings in unfamiliar situations.',
        margin + 14,
        cefrTop + 11
      );

      // SECURITY ELEMENTS (British Council Stamp, Barcode, Signatures)
      const secTop = cefrTop + 22;

      // Administrator Signature Box
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin + 8, secTop, 55, 36);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Administrator Signature:', margin + 12, secTop + 6);

      // Signature cursive representation
      doc.setFont('courier', 'bolditalic');
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('E. R. Sterling', margin + 16, secTop + 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Authorized Testing Officer', margin + 12, secTop + 32);

      // British Council Official Validation Stamp (Circular Red Seal)
      const stampCenterX = margin + 95;
      const stampCenterY = secTop + 18;

      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.7);
      doc.circle(stampCenterX, stampCenterY, 16);
      doc.setLineWidth(0.3);
      doc.circle(stampCenterX, stampCenterY, 14);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(220, 38, 38);
      doc.text('BRITISH COUNCIL', stampCenterX, stampCenterY - 9, { align: 'center' });
      doc.text('TEST CENTRE VALIDATED', stampCenterX, stampCenterY - 4, { align: 'center' });
      doc.text('IA008 · LONDON', stampCenterX, stampCenterY + 1, { align: 'center' });
      doc.text('OFFICIAL EXAM STAMP', stampCenterX, stampCenterY + 6, { align: 'center' });
      doc.text('★ VERIFIED ★', stampCenterX, stampCenterY + 11, { align: 'center' });

      // Linear Security Barcode
      const barcodeX = pageWidth - margin - 55;
      doc.setDrawColor(203, 213, 225);
      doc.rect(barcodeX - 4, secTop, 51, 36);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Security Barcode:', barcodeX, secTop + 6);

      // Draw simulated linear barcode lines
      doc.setFillColor(15, 23, 42);
      const barTop = secTop + 10;
      const barH = 15;
      const barPattern = [1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1];
      let curX = barcodeX;
      barPattern.forEach((w) => {
        doc.rect(curX, barTop, w * 0.7, barH, 'F');
        curX += (w + 1) * 0.7;
      });

      doc.setFont('courier', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text(trfNumber, barcodeX + 22, secTop + 30, { align: 'center' });

      // Bottom Legal Verification Notice
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const footerY = 270;
      doc.text(
        'The validity of this IELTS Test Report Form can be verified online by recognizing organisations at https://ielts.ucles.org.uk',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
      doc.text(
        'Disclaimer: This simulation Test Report Form is generated for authentic practice and Cambridge CDT familiarisation.',
        pageWidth / 2,
        footerY + 4,
        { align: 'center' }
      );

      // Save PDF file to client
      const filename = `IELTS_TRF_${result.candidateName.replace(/\s+/g, '_')}_Band_${result.overallBand}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print TRF Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full my-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Toolbar Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 block">
                Official Certification Preview
              </span>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Simulated IELTS Test Report Form (TRF)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Copy TRF Number */}
            <button
              onClick={handleCopyTRF}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Copy official TRF verification number"
            >
              {copiedTRF ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTRF ? 'Copied' : trfNumber}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              title="Print document via system print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
              title="Download print-ready PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
          {/* THE AUTHENTIC A4 TEST REPORT FORM SHEET */}
          <div
            id="ielts-trf-document"
            className="w-full max-w-[780px] bg-white text-slate-900 border-2 border-slate-800 shadow-2xl p-8 relative flex flex-col justify-between"
            style={{ minHeight: '920px' }}
          >
            {/* Top Official Logos & Academic Header */}
            <div>
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-wider text-slate-700 uppercase block">
                    CAMBRIDGE ASSESSMENT ENGLISH  ·  BRITISH COUNCIL  ·  IDP: IELTS AUSTRALIA
                  </span>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">
                    Test Report Form
                  </h1>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-blue-50 border border-blue-600 text-blue-700 tracking-wider">
                    ACADEMIC
                  </span>
                </div>
              </div>

              {/* TRF Number Banner */}
              <div className="my-4 p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Test Report Form Number:
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                    {trfNumber}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Date of Test: <strong>{result.date}</strong>
                </div>
              </div>

              {/* Candidate Bio Block */}
              <div className="grid grid-cols-12 gap-4 my-6 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                {/* Photo Placeholder */}
                <div className="col-span-3 aspect-[3/4] rounded-lg bg-slate-200 border border-slate-300 flex flex-col items-center justify-center text-center p-2 relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-slate-500 mb-1">
                    <User className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Candidate Photo
                  </span>
                  <span className="text-[9px] text-rose-600 font-bold uppercase mt-1">
                    Authenticated
                  </span>
                  {/* Subtle watermark diagonal text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 rotate-[-30deg]">
                    <span className="text-xs font-mono font-black text-slate-900">IDP · BRITISH COUNCIL</span>
                  </div>
                </div>

                {/* Candidate Credentials Details */}
                <div className="col-span-9 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Family Name</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {result.candidateName.split(' ').slice(-1)[0]?.toUpperCase() || 'CANDIDATE'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">First Name(s)</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {result.candidateName.split(' ').slice(0, -1).join(' ').toUpperCase() || result.candidateName.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate Number</span>
                    <span className="font-mono font-bold text-slate-900">{result.candidateNumber}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Centre Number</span>
                    <span className="font-bold text-slate-900">IA008</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Scheme Code</span>
                    <span className="font-mono text-slate-800">Private Candidate</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Test Venue</span>
                    <span className="font-medium text-slate-800 truncate block">{result.testCenterCode}</span>
                  </div>
                </div>
              </div>

              {/* TEST RESULTS GRID */}
              <div className="my-6">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-2">
                  Test Results
                </span>

                <div className="grid grid-cols-5 border-2 border-slate-900 rounded-lg overflow-hidden text-center divide-x-2 divide-slate-900">
                  <div className="p-3 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block">Listening</span>
                    <span className="text-2xl font-black font-mono text-slate-900 block mt-1">
                      {formatBand(result.listeningBand)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {result.listeningRaw}/40
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block">Reading</span>
                    <span className="text-2xl font-black font-mono text-slate-900 block mt-1">
                      {formatBand(result.readingBand)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {result.readingRaw}/40
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block">Writing</span>
                    <span className="text-2xl font-black font-mono text-slate-900 block mt-1">
                      {formatBand(result.writingBand)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Evaluated
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block">Speaking</span>
                    <span className="text-2xl font-black font-mono text-slate-900 block mt-1">
                      {formatBand(result.speakingBand)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Standard
                    </span>
                  </div>

                  {/* PROMINENT OVERALL BAND SCORE */}
                  <div className="p-3 bg-blue-600 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 block">
                      Overall Band
                    </span>
                    <span className="text-3xl font-black font-mono block mt-1">
                      {formatBand(result.overallBand)}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-200 uppercase">
                      {result.cefrLevel.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* CEFR Level Box */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">
                    CEFR Level: {result.cefrLevel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Demonstrates competent operational language command under the Common European Framework of Reference.
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            </div>

            {/* BOTTOM SECURITY SEALS, SIGNATURE, & BARCODE */}
            <div className="mt-8 pt-6 border-t-2 border-slate-900">
              <div className="grid grid-cols-3 gap-6 items-center">
                {/* Administrator Signature */}
                <div className="p-3 rounded border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
                    Administrator Signature
                  </span>
                  <div className="font-serif italic font-bold text-base text-slate-800 tracking-wider">
                    E. R. Sterling
                  </div>
                  <span className="text-[9px] text-slate-400 block border-t border-slate-200 mt-2 pt-1">
                    Center Administrator
                  </span>
                </div>

                {/* British Council Circular Red Stamp */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-red-600 border-dashed flex flex-col items-center justify-center text-center p-1.5 rotate-[-6deg] text-red-600 select-none">
                    <span className="text-[8px] font-bold font-mono tracking-tight uppercase">
                      BRITISH COUNCIL
                    </span>
                    <span className="text-[7px] font-bold border-y border-red-600 my-0.5 px-1 uppercase">
                      Validated IA008
                    </span>
                    <span className="text-[6.5px] font-semibold">
                      ★ AUTHORIZED ★
                    </span>
                  </div>
                </div>

                {/* Validation Barcode */}
                <div className="p-3 rounded border border-slate-200 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Security Barcode
                  </span>
                  {/* SVG Linear Barcode */}
                  <svg className="w-36 h-9" viewBox="0 0 140 35" fill="none">
                    <rect x="2" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="6" y="2" width="4" height="30" fill="#0f172a" />
                    <rect x="12" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="15" y="2" width="3" height="30" fill="#0f172a" />
                    <rect x="20" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="24" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="27" y="2" width="4" height="30" fill="#0f172a" />
                    <rect x="33" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="37" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="40" y="2" width="3" height="30" fill="#0f172a" />
                    <rect x="45" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="49" y="2" width="4" height="30" fill="#0f172a" />
                    <rect x="55" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="58" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="62" y="2" width="3" height="30" fill="#0f172a" />
                    <rect x="67" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="70" y="2" width="4" height="30" fill="#0f172a" />
                    <rect x="76" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="80" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="83" y="2" width="3" height="30" fill="#0f172a" />
                    <rect x="88" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="92" y="2" width="4" height="30" fill="#0f172a" />
                    <rect x="98" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="101" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="105" y="2" width="3" height="30" fill="#0f172a" />
                    <rect x="110" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="113" y="2" width="4" height="30" fill="#0f172a" />
                    <rect x="119" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="123" y="2" width="2" height="30" fill="#0f172a" />
                    <rect x="127" y="2" width="3" height="30" fill="#0f172a" />
                    <rect x="132" y="2" width="1" height="30" fill="#0f172a" />
                    <rect x="135" y="2" width="3" height="30" fill="#0f172a" />
                  </svg>
                  <span className="font-mono text-[9px] font-bold text-slate-800 tracking-wider mt-0.5">
                    {trfNumber}
                  </span>
                </div>
              </div>

              {/* Bottom Verification Legend */}
              <div className="mt-6 text-center text-[9px] text-slate-500 space-y-0.5">
                <p>
                  The validity of this IELTS Test Report Form can be verified online by recognizing organisations at{' '}
                  <span className="underline font-mono">https://ielts.ucles.org.uk</span>
                </p>
                <p className="text-[8px] text-slate-400">
                  Produced for official Computer-Delivered IELTS Cambridge Mock Simulation. Retain this document for your records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

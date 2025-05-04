const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generates a professional PDF report for an orphan.
 * @param {Object} data - Data for the report.
 * @param {number} data.orphan_id - ID of the orphan.
 * @param {string} data.report_type - Type of the report (e.g., education, health).
 * @param {string} data.description - Detailed description of the report.
 * @param {string|null} data.photoUrl - Optional photo URL.
 * @returns {Promise<string>} - Resolves with the PDF file path.
 */
exports.generateReportPDF = ({ orphan_id, report_type, description, photoUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const fileName = `report_${orphan_id}_${timestamp}.pdf`;
      const filePath = path.join("public", "reports", fileName);
      const doc = new PDFDocument({ margin: 50 });

      // Create PDF write stream
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(22)
        .text("HopeConnect - Orphan Report", { align: "center" })
        .moveDown(1);

      // Basic Info
      doc
        .fontSize(14)
        .text(`Report Type: ${report_type}`, { continued: true })
        .text(`     Orphan ID: ${orphan_id}`)
        .moveDown(1);

      // Optional Image
      if (photoUrl) {
        const fullPath = path.join("public", photoUrl);
        if (fs.existsSync(fullPath)) {
          doc.image(fullPath, {
            fit: [200, 200],
            align: "center",
            valign: "center",
          }).moveDown(1);
        }
      }

      // Description
      doc
        .fontSize(12)
        .text("Report Description:", { underline: true })
        .moveDown(0.5)
        .font("Times-Roman")
        .text(description, { align: "justify" });

      // Footer
      doc
        .moveDown(2)
        .fontSize(10)
        .fillColor("gray")
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "right",
        });

      // Finalize
      doc.end();

      stream.on("finish", () => resolve(`/reports/${fileName}`));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

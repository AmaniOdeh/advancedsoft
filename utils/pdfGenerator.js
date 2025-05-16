const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateReportPDF = ({ orphan_id, report_type, description, photoUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const fileName = `report_${orphan_id}_${timestamp}.pdf`;
      const filePath = path.join("public", "reports", fileName);
      const doc = new PDFDocument({ margin: 50 });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc
        .fillColor("#0E3D59")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("HopeConnect", { align: "center" })
        .fontSize(18)
        .text("Orphan Report", { align: "center" })
        .moveDown(1.5);

      // Report Info Section
      doc
        .fillColor("black")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Report Type:", { continued: true })
        .font("Helvetica")
        .text(` ${report_type}`)
        .font("Helvetica-Bold")
        .text("Orphan ID:", { continued: true })
        .font("Helvetica")
        .text(` ${orphan_id}`)
        .moveDown(1);

      // Optional Photo
      if (photoUrl) {
        const fullPath = path.join("public", photoUrl);
        if (fs.existsSync(fullPath)) {
          doc
            .image(fullPath, {
              fit: [300, 300],
              align: "center",
              valign: "center",
            })
            .moveDown(1);
        }
      }

      // Description Section
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("Report Description:", { underline: true })
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(12)
        .text(description || "No description provided.", {
          align: "justify",
          lineGap: 4,
        });

      // Footer
      doc
        .moveDown(2)
        .fontSize(10)
        .fillColor("gray")
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "right",
        });

      doc.end();

      stream.on("finish", () => resolve(`/reports/${fileName}`));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

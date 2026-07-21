package com.civicpulse.services.service;

import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
public class CertificatePdfService {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMMM yyyy");

    public byte[] generate(ServiceApplicationResponse application) {
        String approvalDate = application.getApprovedAt() == null
                ? "Not available"
                : application.getApprovedAt().format(DATE_FORMAT);
        String content = "BT\n"
                + "/F1 22 Tf\n72 760 Td\n(CivicPulse Nexus) Tj\n"
                + "/F1 15 Tf\n0 -32 Td\n(Certificate of Municipal Service) Tj\n"
                + "/F1 11 Tf\n0 -55 Td\n(Certificate Number: " + escape(application.getCertificateNumber()) + ") Tj\n"
                + "0 -24 Td\n(Applicant Name: " + escape(application.getApplicantName()) + ") Tj\n"
                + "0 -24 Td\n(Service Type: " + escape(application.getServiceType().name().replace('_', ' ')) + ") Tj\n"
                + "0 -24 Td\n(Approval Date: " + escape(approvalDate) + ") Tj\n"
                + "0 -48 Td\n(This certificate is issued by CivicPulse Nexus Municipal Services.) Tj\n"
                + "0 -70 Td\n(" + escape(application.getDigitalSignature()) + ") Tj\n"
                + "ET\n";

        String[] objects = {
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
                "<< /Length " + content.getBytes(StandardCharsets.US_ASCII).length + " >>\nstream\n" + content + "endstream",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
        };

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        int[] offsets = new int[objects.length + 1];
        for (int index = 0; index < objects.length; index++) {
            offsets[index + 1] = pdf.toString().getBytes(StandardCharsets.US_ASCII).length;
            pdf.append(index + 1).append(" 0 obj\n").append(objects[index]).append("\nendobj\n");
        }
        int xrefOffset = pdf.toString().getBytes(StandardCharsets.US_ASCII).length;
        pdf.append("xref\n0 ").append(objects.length + 1).append("\n0000000000 65535 f \n");
        for (int index = 1; index < offsets.length; index++) {
            pdf.append(String.format("%010d 00000 n \n", offsets[index]));
        }
        pdf.append("trailer\n<< /Size ").append(objects.length + 1).append(" /Root 1 0 R >>\nstartxref\n")
                .append(xrefOffset).append("\n%%EOF");
        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replaceAll("[^\\x20-\\x7E]", " ")
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }
}

import { Router, Request, Response } from 'express';
import { createAssignment, getAssignments, deleteAssignment, getAssignmentById } from '../controllers/assignment.controller';
import multer from 'multer';
const pdfParse = require('pdf-parse');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.delete('/:id', deleteAssignment);

// Handle file extraction
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    try {
        console.log("Receiving file upload request...");
        if (!req.file) {
            console.error("No file found in request.");
            return res.status(400).json({ error: "No file provided" });
        }
        
        console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
        let extractedText = "";

        if (req.file.mimetype === 'application/pdf') {
            try {
                console.log("Starting PDF extraction with pdf-parse...");
                const data = await (pdfParse as any)(req.file.buffer);
                extractedText = data.text || "";
                console.log(`Extracted ${extractedText.length} characters from PDF.`);
                
                if (extractedText.trim().length < 10) {
                    console.warn("PDF extraction returned very little text.");
                }
            } catch (pdfErr: any) {
                console.error("PDF Parsing error:", pdfErr);
                return res.status(500).json({ 
                    error: "Failed to read PDF content.",
                    details: pdfErr.message 
                });
            }
        } else {
            console.log("Processing as plain text file.");
            extractedText = req.file.buffer.toString('utf-8');
        }

        const cleanedText = extractedText
            .replace(/\r\n/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        if (!cleanedText && req.file.mimetype === 'application/pdf') {
             return res.status(422).json({ error: "No readable text found in the PDF." });
        }

        return res.status(200).json({ text: cleanedText });
    } catch (e: any) {
        console.error("Upload route fatal crash:", e);
        return res.status(500).json({ error: e.message });
    }
});

export default router;

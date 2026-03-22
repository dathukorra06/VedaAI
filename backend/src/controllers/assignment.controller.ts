import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment';
import { addAssignmentJob } from '../queue/jobQueue';
import { io } from '../server';
import { generatePaper } from '../services/ai.service';

export const createAssignment = async (req: Request, res: Response) => {
  try {
    let assignmentId = new mongoose.Types.ObjectId().toString();
    const isMock = mongoose.connection.readyState !== 1;
    
    let newAssignment: any;
    
    if (isMock) {
        console.warn("MongoDB offline. Mocking assignment creation.");
        newAssignment = { ...req.body, _id: assignmentId, jobStatus: 'queued', save: async () => {} };
    } else {
        newAssignment = new Assignment({ ...req.body, jobStatus: 'queued' });
        await newAssignment.save();
        assignmentId = newAssignment._id.toString();
    }

    try {
      let assignmentData: any;
      if (isMock) {
          assignmentData = newAssignment;
      } else {
          assignmentData = await Assignment.findById(assignmentId);
          if (!assignmentData) throw new Error("Assignment not found");
      }
      
      // Process generation synchronously for Vercel (Serverless) compatibility
      const paper = await generatePaper(assignmentData);
      
      assignmentData.jobStatus = 'done';
      assignmentData.generatedPaper = paper;
      if (!isMock) await assignmentData.save();

      res.status(201).json({ message: "Assignment created", assignment: assignmentData, paper });
    } catch (err: any) {
      console.error("Sync Job failed:", err);
      if (!isMock) await Assignment.findByIdAndUpdate(assignmentId, { jobStatus: 'error' });
      res.status(500).json({ error: "Generation failed", details: err.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       console.warn("MongoDB not connected. Returning empty assignment list.");
       return res.status(200).json([]);
    }
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Not found" });
    res.status(200).json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

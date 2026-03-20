import { Worker, Job } from 'bullmq';
import redisClient from '../config/redis';
import Assignment from '../models/Assignment';
import { generatePaper } from '../services/ai.service';

// Lazy getter to break circular import: server → worker → server
const getIo = () => require('../server').io;

export const assignmentWorker = new Worker('assignment-generation', async (job: Job) => {
  const assignmentId = job.data.assignmentId;
  const io = getIo();

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const broadcast = (status: string, progress: number, message: string, paper: any = null) => {
      io.emit(`job-${assignmentId}`, { status, progress, message, paper });
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    broadcast('processing', 10, 'Job queued...');
    await delay(600);
    broadcast('processing', 25, 'Analyzing assignment details...');
    await delay(800);
    broadcast('processing', 40, 'Structuring question prompt...');
    await delay(600);
    broadcast('processing', 55, 'Calling AI model...');

    const paper = await generatePaper(assignment);

    broadcast('processing', 75, 'Parsing question paper...');
    await delay(500);
    broadcast('processing', 90, 'Storing to database...');

    assignment.jobStatus = 'done';
    assignment.generatedPaper = paper;
    await assignment.save();

    broadcast('done', 100, 'Question paper ready!', paper);
    return paper;

  } catch (error: any) {
    console.error(`Job ${job.id} failed:`, error);
    io.emit(`job-${assignmentId}`, { status: 'error', progress: 0, message: error.message || "Generation failed" });
    await Assignment.findByIdAndUpdate(assignmentId, { jobStatus: 'error' });
    throw error;
  }
}, { connection: redisClient });

assignmentWorker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});
assignmentWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});

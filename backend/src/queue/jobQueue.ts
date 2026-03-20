import { Queue } from 'bullmq';
import redisClient from '../config/redis';

// Only create queue if redis host is provided, wait actually simple fallback
export let assignmentQueue: Queue | null = null;

try {
  assignmentQueue = new Queue('assignment-generation', {
    connection: redisClient
  });
} catch (e) {
  console.log("Redis not available. Queue won't be used.");
}

export const addAssignmentJob = async (assignmentData: any) => {
  if (assignmentQueue && redisClient.status === 'ready') {
      return await assignmentQueue.add('generate-paper', assignmentData);
  } else {
      throw new Error("RedisNotReady");
  }
};

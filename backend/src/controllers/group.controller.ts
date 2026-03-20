import { Request, Response } from 'express';
import Group from '../models/Group';
import mongoose from 'mongoose';

export const createGroup = async (req: Request, res: Response) => {
  try {
    const isMock = mongoose.connection.readyState !== 1;
    let newGroup: any;
    
    if (isMock) {
        console.warn("MongoDB offline. Mocking group creation.");
        newGroup = { ...req.body, _id: new mongoose.Types.ObjectId().toString(), createdAt: new Date() };
    } else {
        newGroup = new Group(req.body);
        await newGroup.save();
    }
    
    res.status(201).json({ message: "Group created", group: newGroup });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       return res.status(200).json([]);
    }
    const groups = await Group.find().sort({ createdAt: -1 });
    res.status(200).json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Group deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const isMock = mongoose.connection.readyState !== 1;
    
    if (isMock) {
        return res.status(200).json({ message: "Member added (Mock)" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members) group.members = [];
    group.members.push(name);
    group.membersCount = group.members.length;
    await group.save();

    res.status(200).json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

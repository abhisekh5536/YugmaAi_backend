import express from 'express';
import Generation from '../models/Generation.js';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// save/post generation (upsert)

router.post("/", protect, async(req, res) => {
    const {prompt, html, css, js, summary, name, id} = req.body;
    
    try {
        const filter = id ? { _id: id, user: req.user } : { _id: new mongoose.Types.ObjectId() };
        const update = {
            prompt,
            name,
            html,
            css,
            js,
            summary,
            user: req.user
        };
        
        const generation = await Generation.findOneAndUpdate(
            filter,
            update,
            { 
                new: true,
                upsert: true,
                setDefaultsOnInsert: true 
            }
        );
        
        res.status(200).json(generation);
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
});
// get all generations from logged in user
router.get("/", protect, async(req, res) => {
    const generations = await Generation.find({ user:req.user }).sort({createdAt:-1});
    res.json(generations);
});
// get single generation
router.get("/:id", protect, async(req, res) => {
    const generation = await Generation.findById(req.params.id);
    if(!generation) return res.status(404).json({message: "Generation not found"});
    res.json(generation);
});
// update generation
router.put("/:id", protect, async(req, res) => {
    const {prompt, html, css, js, summary, name} = req.body;
    const generation = await Generation.findById(req.params.id);
    if(!generation) return res.status(404).json({message: "Generation not found"});
    generation.prompt = prompt;
    generation.name = name;
    generation.html = html;
    generation.css = css;
    generation.js = js;
    generation.summary = summary;
    await generation.save();
    res.json(generation);
});
// delete generation
router.delete("/:id", protect, async (req, res) => {
    try {
        if(!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) { 
            return res.status(400).json({message: "Invalid generation ID"});
        }
        
        const generation = await Generation.findOne({
            _id: req.params.id,
            user: req.user 
        });
        
        if (!generation) {
            return res.status(404).json({message: "Generation not found"});
        }
        
        await generation.deleteOne();
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});




export default router;


import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema({
user: {type: mongoose.Schema.Types.ObjectId,required: true},
prompt: String,
  html: String,
  css: String,
  js: String,
  summary: String,
  name: String,
  
}, { timestamps: true })

export default mongoose.model("Generation",generationSchema);
import DiaryModel from "../models/model.js";

// Get all diarys
export const getDiarys = async (req, res) => {
    try{
        // Return all diarys
        const diarys = await DiaryModel.find({});
        return res.status(200).json(diarys);
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

// Create a diary
export const createDiarys = async (req, res) => {
    const {date, tag, mood, text, image} = req.body;
    
    // Check date, tag, mood, text
    if(!date || !tag || ! mood || !text){
        return res.status(400).json({ message: "Date, tag, mood and text are required!" });
    }
    
    // Create a new todo
    try{
        const newTodo = await DiaryModel.create({
            date,
            tag,
            mood,
            text,
            image,
        });
        return res.status(201).json(newTodo);
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }

};

// update a diary
export const updateDiary = async (req, res) => {
    const {id} = req.params;
    const {date, tag, mood, text, image} = req.body;

    try{
        // Check if the id is valid
        const existedDiary = await DiaryModel.findById(id);
        if(!existedDiary){
            return res.status(404).json({ message: "Diary not found!" });
        }
    
        // Update the diary
        if(date !== undefined) existedDiary.date = date;
        if(tag !== undefined) existedDiary.tag = tag;
        if(mood !== undefined) existedDiary.mood = mood;
        if(text !== undefined) existedDiary.text = text;
        if(image !== undefined) existedDiary.image = image;
    
        // Save the updated todo
        await existedDiary.save();
    
        // Rename _id to id
        existedDiary.id = existedDiary._id;
        delete existedDiary._id;
    
        return res.status(200).json(existedDiary);
      }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};

// delete a diary
export const deleteDiary = async (req, res) => {
    const {id} = req.params;
    try{
        // Check if the id is valid
        const existedDiary = await DiaryModel.findById(id);
        if(!existedDiary){
          return res.status(404).json({ message: "Diary not found!" });
        }
        // Delete the todo
        await DiaryModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Diary deleted successfully!" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
};
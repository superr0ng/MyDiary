import {
    getDiarys, 
    createDiarys, 
    updateDiary, 
    deleteDiary,
} from "../controllers/controller.js";

import express from "express";

// Create an express router
const router = express.Router();

// Every path we define here will get /api/todos prefix
// To make code even more cleaner we can wrap functions in `./controllers` folder

// GET /api/diarys
router.get("/", getDiarys);
// POST /api/todos
router.post("/", createDiarys);
// PUT /api/todos/:id
router.put("/:id", updateDiary);
// DELETE /api/todos/:id
router.delete("/:id", deleteDiary);


// export the router
export default router;
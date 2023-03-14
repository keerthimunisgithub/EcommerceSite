const express= require("express");
const { 
    createBlog, 
    updateBlog, 
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    dislikeBlog,
uploadImages,
     } = require("../controller/blogCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto,blogImgReSize } = require("../middlewares/uploadImages");
const router= express.Router();
router.post("/",authMiddleware,isAdmin,createBlog);
router.put("/likes",authMiddleware,likeBlog);
router.put("/dislikes",authMiddleware,dislikeBlog);
router.put("/upload/:id",authMiddleware,isAdmin,uploadPhoto.array("images",2),
blogImgReSize,uploadImages );
router.put("/:id",authMiddleware,isAdmin,updateBlog);
router.get("/:id",getBlog);
router.get("/",getAllBlogs);
router.delete("/:id",authMiddleware,isAdmin,deleteBlog);


module.exports=router;
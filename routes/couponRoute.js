const express= require("express");
const { CreateCoupon, getAllCoupon, updateCoupon, deleteCoupon } = require("../controller/couponCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router=express.Router();

router.post("/",authMiddleware,isAdmin ,CreateCoupon);
router.put("/:id",authMiddleware,isAdmin ,updateCoupon);
router.delete("/:id",authMiddleware,isAdmin ,deleteCoupon);
router.get("/",authMiddleware,isAdmin ,getAllCoupon);



module.exports=router;
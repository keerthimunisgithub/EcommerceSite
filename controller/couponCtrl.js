const Coupon= require("../models/couponModel");
const validateMongoDbId=require("../utils/validateMongodbid");
const  asyncHandler=require("express-async-handler");

const CreateCoupon= asyncHandler(async(req, res)=>{
    try{
    const newCoupon= await Coupon.create(req.body);
    res.json(newCoupon);
    }
    catch(error)
    {
        throw new Error(error);
    }
});
const updateCoupon= asyncHandler(async(req, res)=>{
    const { id }=req.params;
    validateMongoDbId(id);
    try{
    const updatedCoupon= await Coupon.findByIdAndUpdate(id,req.body,
        {
            new:true
        });
    res.json(updatedCoupon);
    }
    catch(error)
    {
        throw new Error(error);
    }
});
const deleteCoupon= asyncHandler(async(req, res)=>{
    const { id }=req.params;
    validateMongoDbId(id);
    try{
    const deletedCoupon= await Coupon.findByIdAndDelete(id);
    res.json(deletedCoupon);
    }
    catch(error)
    {
        throw new Error(error);
    }
});
const getAllCoupon= asyncHandler(async(req, res)=>{
    try{
    const getallCoupon= await Coupon.find();
    res.json(getallCoupon);
    }
    catch(error)
    {
        throw new Error(error);
    }
});

module.exports={CreateCoupon,getAllCoupon,updateCoupon,deleteCoupon};
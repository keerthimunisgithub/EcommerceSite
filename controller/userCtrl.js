const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon= require("../models/couponModel");
const Order=require("../models/orderModel");
const uniqid= require("uniqid");

const asycHandler= require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generaterefreshToken } = require("../config/refreshtoken");
const jwt= require("jsonwebtoken");
const sendEmail = require("./emailctrl");
const crypto = require("crypto");

 //create a User
const createUser =asycHandler( async(req,res)=>{
    const email=req.body.email;
    const findUser=await User.findOne({email:email});
    if(!findUser){
//create new user
const newUser=await User.create(req.body);
res.json(newUser);
    }
    else{
//User already exsist
throw new Error("User Already Exsits");
    }
});
  
const loginUserCtrl = asycHandler(async(req, res) => {
const { email,password } = req.body;
console.log(req.body);
//check if user exsits or not
const findUser = await User.findOne({ email });
if(findUser && await findUser.isPasswordMatched(password)){
    const refreshToken = await generaterefreshToken(findUser?._id);
    const updateuser= await User.findByIdAndUpdate(
        findUser.id,{
        refreshToken:refreshToken,
    } ,
     {new: true}
    );
    res.cookie("refreshToken", refreshToken,{
     httpOnly : true,
    maxAge: 72*60*60*1000,
    }); 
res.json({
    _id: findUser?._id,
    firstname:findUser?.firstname,
    lastname:findUser?.lastname,
    email: findUser?.email,
    mobile: findUser?.mobile,
    token:generateToken(findUser?._id), 
});
}else{
    throw new Error("Invalid Creadintials");
}
});


//admin login
const loginAdmin = asycHandler(async(req, res) => {
    const { email,password } = req.body;
    //check if user exsits or not
    const findAdmin = await User.findOne({ email });
    if(findAdmin.role !== "admin" )
    throw new Error("Not authorized");

    if(findAdmin && await findAdmin.isPasswordMatched(password)){
        const refreshToken = await generaterefreshToken(findAdmin?._id);
        const updateuser= await User.findByIdAndUpdate(
            findAdmin.id,{
            refreshToken:refreshToken,
        } ,
         {new: true}
        );
        res.cookie("refreshToken", refreshToken,{
         httpOnly : true,
        maxAge: 72*60*60*1000,
        }); 
    res.json({
        _id: findAdmin?._id,
        firstname:findAdmin?.firstname,
        lastname:findAdmin?.lastname,
        email: findAdmin?.email,
        mobile: findAdmin?.mobile,
        token:generateToken(findAdmin._id), 
    });
    }else{
        throw new Error("Invalid Creadintials");
    }
    });





//handle refresh token
const handleRefreshToken= asycHandler(async(req, res) => {
     const cookie = req.cookies;
     console.log(cookie);
     if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
     const refreshToken= cookie.refreshToken;
     console.log(refreshToken);
     const user= await User.findOne({refreshToken});
     if(!user) throw new Error('No Refresh Token in Db or not matched');
     
     jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded) =>{
        if(err || user.id !== decoded.id){
            throw new Error('There is Something wrong with the refresh token');
        }
        const accessToken= generateToken(user?._id);
        res.json({ accessToken });
     });
});

//logout  functionality
const logout =asycHandler(async (req, res)=>{
const cookie =req.cookies;
if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
const refreshToken= cookie.refreshToken;
const user= await User.findOne({refreshToken});
if(!user){
    res.clearCookie("refreshToken",{
    httpOnly:true,
    secure:true,
    });
    return res.sendStatus(204);
}
await User.findOneAndUpdate(refreshToken,{
    refreshToken:"",
});
res.clearCookie("refreshToken",{
    httpOnly:true,
    secure:true,
    });
     res.sendStatus(204);

}); 

//update a user
const updatedUser=asycHandler(async(req, res)=>{
const { _id } = req.user;
validateMongoDbId(_id);
try{
const updatedUser= await User.findByIdAndUpdate(_id,{
    firstname:req?.body?.firstname,
    lastname:req?.body?.lastname,
    email:req?.body?.email,
    mobile:req?.body?.mobile,
},{
    new: true,
});
res.json(updatedUser);
}catch(error){
    throw new Error(error);
}
});
//Save user Address

const saveAddress =asycHandler(async(req, res) =>{
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const updatedUser= await User.findByIdAndUpdate(_id,{
            address:req?.body?.address,
        },{
            new: true,
        });
        res.json(updatedUser);
        }catch(error){
            throw new Error(error);
        }
});

//Get all users
const getallUser= asycHandler(async(req, res) =>{
    try{
        const getUsers=await User.find();
        res.json(getUsers);
    }catch(error){
        throw new Error(error);

    }
});

//Get a single user
const getaUser= asycHandler(async(req, res) => {
    const { id }= req.params;
    validateMongoDbId(id);
    try{
        const getaUser=await User.findById(id);
        res.json({
            getaUser,
        });
    }
    catch (error){
        throw new Error(error);
    }  
});

//Delete a single user
const deleteaUser= asycHandler(async(req, res) => { 
    const { id }= req.params;
    validateMongoDbId(id);
    try{
        const deleteaUser=await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        });
    }
    catch (error){
        throw new Error(error);
    }  
});
const blockUser= asycHandler(async (req, res) =>{
    const { id } = req.params;
    validateMongoDbId(id);
    try{
const block=await User.findByIdAndUpdate(id,
    {
        isBlocked:true,
    },
    { 
        new :true,
    }
    );
    res.json({
        message: "User Blocked",
    });
    }
    catch (error){
        throw new Error(error);
    }  
});
const unblockUser= asycHandler(async (req, res) =>{
     const { id }=req.params;
     validateMongoDbId(id);
try{
const unblock=await User.findByIdAndUpdate(id,
{
    isBlocked:false,
},
{ 
    new :true,
}
);
res.json({
    message: "User UnBlocked",
});
}
catch (error){
    throw new Error(error);
}  
});

const updatePassword = asycHandler(async( req,res ) => {
    const {_id} =req.user;
    const { password }=req.body;
    validateMongoDbId(_id);
    const user=await User.findById(_id);
    if(password){
    user.password=password;
    const updatedPassword=await user.save(); 
    res.json(updatedPassword);
    }
    else{
        res.json(user);
    }
});


const forgotPasswordToken=asycHandler(async (req,res)=>{
const { email }= req.body;
const user=await User.findOne({ email });
if(!user) throw new Error("User not found with this Email");
try{
const token= await user.createPasswordResetToken();
await user.save();
const resetURL=`Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now.
 <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here </>`;

 const data={
    to:email,
    text:"Hey User",
    subject:"Forgot Password Link",
    htm:resetURL,
 };
 sendEmail(data);
 res.json(token);
}
catch (error){
    throw new Error(error);
}
});

const resetPassword=asycHandler(async(req,res)=>{
const { password } =req.body;
const {token}=req.params;
const hashedToken=crypto.createHash("sha256").update(token).digest("hex");
const user= await User.findOne({
    passwordResetToken:hashedToken,
    passwordResetExpires : {$gt : Date.now()},
});
if(!user) throw new Error(" Token Expired, Please Try again later");
user.password=password;
user.passwordResetToken=undefined;
user.passwordResetExpires=undefined;
await user.save();
res.json(user);
});

const getWishlist=asycHandler(async (req,res)=>{
    const { _id }=req.user;
    //validateMongoDbId(_id);
    try{
        const findUser= await User.findById(_id).populate("wishlist");
        res.json(findUser);
    }
    catch(error)
    {
   throw new Error(error);
    }
});

const userCart= asycHandler(async (req,res)=>{
    const { _id } =req.user;
    const { cart }= req.body;
    validateMongoDbId(_id);
    try{
        let products=[];
        const user= await User.findById(_id);
        //check if user already have a product in cart
        const alreadyExistCart=await Cart.findOne({orderby:user._id});
        if(alreadyExistCart)
        {
            alreadyExistCart.remove();
        }
        for(let i=0;i<cart.length;i++)
        {
            let object={};
            object.product =cart[i]._id;
            object.count=cart[i].count;
            object.color=cart[i].color;
            let getPrice=await Product.findById(cart[i]._id).select("price").exec();
            object.price=getPrice.price;
            products.push(object);
        }
     let cartTotal=0;
     for(let i=0;i<products.length;i++){
        cartTotal=cartTotal+products[i].price * products[i].count;
         }  
         let newCart= await new Cart({
            products,
            cartTotal,
            orderby:user?._id,
         }).save();
         res.json(newCart);      
    }       
    catch(error)
   {
    throw new Error(error);
   }
});

const getUserCart=asycHandler(async(req,res)=>{
    const {_id}=req.user;
    validateMongoDbId(_id);
    try{
   const cart= await Cart.findOne({orderby:_id}).populate(
    "products.product" );
    res.json(cart);
    }
    catch(error)
    {
     throw new Error(error);
    }
});

const emptyCart=asycHandler(async(req,res)=>{
    const {_id}=req.user;
    validateMongoDbId(_id);
    try{
   const user= await User.findOne({_id});
   const cart= await Cart.findOneAndRemove({orderby: user._id});
    res.json(cart);
    }
    catch(error)
    {
     throw new Error(error);
    }
});

const applyCoupon=asycHandler(async(req,res)=>{
    const { coupon }=req.body;
    const {_id}=req.user;
    validateMongoDbId(_id);
    const validCoupon= await Coupon.findOne({name:coupon});
   if(validCoupon===null)
   { 
    throw new Error("Invalid Coupon");
   }
   const user=await User.findOne({_id});
   let {cartTotal}=await Cart.findOne({orderby:user._id}).populate("products.product"); 

   let totalAfterDiscount=(cartTotal - (cartTotal * validCoupon.discount)/100).toFixed(2);
   await Cart.findOneAndUpdate({orderby:user._id},
    {totalAfterDiscount},
    {new:true});
    res.json(totalAfterDiscount);
    
});

const createOrder= asycHandler(async (req,res)=>{
    const {COD,couponApplied}=req.body;
    const {_id}=req.user;
    validateMongoDbId(_id);

    try{
        if(!COD) throw new Error("Create Cash order failed");
    const user= await User.findById(_id);
    let userCart= await Cart.findOne({ orderby: user._id});
    let finalAmount=0;
    if(couponApplied && userCart.totalAfterDiscount){
        finalAmount=userCart.totalAfterDiscount;
    }
    else{
        finalAmount= userCart.cartTotal;
    }
    let newOrder=await new Order({
        products:userCart.products,
        paymentIntent:{
            id:uniqid(),
            method:"COD",
            amount:finalAmount,
            status:"Cash on Delivery",
            created:Date.now(),
            currency:"usd",
        },
        orderby:user._id,
        orderStatus:"Cash on Delivery",
    }).save();
    let update=userCart.products.map((item)=>{
        return{
            updateOne:{
                filter:{_id:item.product._id},
                update:{$inc:{quantity:-item.count,sold:+item.count}},
            },
        };
    });
    const updated=await Product.bulkWrite(update);
    res.json({message:"success"});
    }
    catch(error)
    {
     throw new Error(error);
    }
});

const getOrders=asycHandler(async(req,res)=>{
    const {_id}=req.user;
    validateMongoDbId(_id);
    try{
        const getuserOrders= await Order.findOne({orderby:_id});
       // .populate("products:product").exec();
        res.json(getuserOrders);
    }
    catch(error)
    {
     throw new Error(error);
    }
});
const updateOrderStatus= asycHandler (async(req,res)=>{
    const {status}=req.body;
    const {id}=req.params;
    
    validateMongoDbId(id);
    try{
        const updateOrderStatus= await Order.findByIdAndUpdate(id,
            {
                orderStatus:status,
                paymentIntent:{
                    status:status,
                },
        },
        {
            new:true
        }
        );
        res.json(updateOrderStatus);
    }
    catch(error)
    {
     throw new Error(error);
    }
});
module.exports ={ 
    createUser,
    loginUserCtrl, 
    getallUser , 
    getaUser, 
    deleteaUser, 
    updatedUser,
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus,
};
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    numViwes:{
        type:Number,
        default:0,
    },
    isLiked:{
        type: Boolean,
        default:false,
    },
    isDisliked:{
        type : Boolean,
        default:false,
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },],
    dislikes:[{ 
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
    },], 
//     image:{
// type:String,
// default:'https://cdn3.wpbeginner.com/wp-content/uploads/2016/11/blogimagetools.jpg',
//     },

    author:  {
        type:String,
        default:"Admin",
    },
    images:[],

},
  {
    toJSON:{
        virtuals:true,
    },toObject:{
        virtuals:true,
    },
    timestamps:true,
  });

//Export the model
module.exports = mongoose.model("Blog", blogSchema);
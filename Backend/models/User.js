import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const UserSchema=new mongoose.Schema({
    username:{
        type: String, 
        required: true, 
        unique: true},
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
    
});

// Password-a save pannurathukku munnadi, adha hash panna idhu use aagum
UserSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
    next();
});

// Login appo, password-a check panna idhu use aagum
UserSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

const User= mongoose.model('User',UserSchema);

export default User;
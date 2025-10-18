const express = require('express');
const router = express.Router();
const db = require('./database');
router.post('/verify',(req,res)=>{
    const {verificationCode} = req.body;
    if(!verificationCode){
        return res.status(400).json({Message: 'Please enter the verification code sent to you'});
    }
    //check if the code is valid
    db.get('Select email FROM users WHERE verification_code = ? AND verified = 0',[verificationCode],(err,user)=>{
        if(err){
            return res.status(500).json({message:'Database error', error:err.message});  
        }
        if(!user.verificationCode){
            return res.status(404).json({message: 'Invalid or expired verification code'});
        }
        db.run('UDPATE users SET verified = 1 WHERE email = ?',[user.email], (updateErr) =>{
            if(updateErr){
                console.error('Error updating verification code:',updateErr.message);
                return res.status(500).json({message: 'Error updating verification status.'});
            }
            res.status(200).json({message: 'Account verified successfully.'});

        })
    });
});
module.exports = router;
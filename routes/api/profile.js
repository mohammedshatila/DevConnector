const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check,validationResult} = require('express-validator');

const Profile = require('../../modules/Profile');
const User = require('../../modules/User');
const Post = require('../../modules/Posts');
const { response } = require('express');



// @route  Get api/Profile/me
// @desc   Get cuttent users profile
// @access Private
 router.get('/me',auth,async (req,res)=>{
     try{
         const profile = await Profile.findOne({user:req.user.id}).populate('user',
         ['name','avatar']);
         if(!profile){
             return res.status(400).json({msg:'There is no profile for this user'})
         }
         res.json(profile);


     } catch(err){
         console.error(err.message);
         res.status(500).send('server Error');


     }
 }); 
 // @route  POST api/Profile/me
// @desc    Create or update user profile
// @access Private
router.post('/', [auth,
    [
        check('status','status is required').not().isEmpty(),
        check('skills','Skills is required').not().isEmpty()
    
    ]],async (req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});

        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;
        // Build profile object
        const profileField ={};
        profileField.user = req.user.id;
        if(company) profileField.company= company;
        if(website) profileField.website= website;
        if(location) profileField.location= location;
        if(bio) profileField.bio= bio;
        if(status) profileField.status= status;
        if(githubusername) profileField.githubusername= githubusername;
        if(skills){
            profileField.skills = skills.split(',').map(skill=>skill.trim())
        }
        // Build social object
        profileField.social = {}
        if(youtube) profileField.social.youtube= youtube;
        if(twitter) profileField.social.twitter= twitter;
        if(facebook) profileField.social.facebook= facebook;
        if(linkedin) profileField.social.linkedin= linkedin;
        if(instagram) profileField.social.instagram= instagram;
        
        try{
            let profile = await Profile.findOne({user: req.user.id});
            if(profile){
                //update
                profile = await Profile.findOneAndUpdate(
                    {user:req.user.id},
                    
                    {$set:profileField},
                    {new:true});
                    return res.json(profile);




            }
            //Create
            profile = new Profile(profileField);
            await profile.save();
            res.json(profile);

        } catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
        })
         // @route  get api/Profile/user/:user_id
         // @desc    get all user
         // @access Public
         router.get('/',async(req,res)=>{
             try {
                 const profiles = await Profile.find().populate('user',['name','avatar']);
                 res.json(profiles);
                 
             } catch (err) {
                 console.error(err.message);
                 res.status(500).send('Server Error');

                 
             }
             
         })
         router.get('/user/:user_id',async(req,res)=>{
            try {
                const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
                if(!profile) 
                  return res.status(400).json({msg:'profile not found'});
                res.json(profile);
                
            } catch (err) {
                console.error(err.message);
                if(err.kind== 'ObjectId'){
                    return res.status(400).json({msg:'Profile not found'});


                }
                res.status(500).send('Server Error');

                
            }
            // @route  DELETE api/Profile
         // @desc    dELETE PROFILE , user and post
         // @access private
       
            
        })
        router.delete('/',auth,async(req,res)=>{
            try {
                // @todo - remove users posts
                await Post.deleteMany({user:req.user.id})
                // remove profile
                 await Profile.findOneAndRemove({user: req.user.id});
                 // Remove user
                 await User.findOneAndRemove({ _id: req.user.id});
                 res.json({msg:'User deleted'});
                
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');

                
            }
            
        })
         // @route  PUT api/Profile/experience
         // @desc    Add profile experience
         // @access Private
         router.put('/experience',[auth,[
             check('title','Title is required').not().isEmpty(),
             check('company','Company is required').not().isEmpty(),
             check('from','From date is required').not().isEmpty()
         ]],async(req,res)=>{
             const errors= validationResult(req);
             if(!errors.isEmpty()){
                 return res.status(400).json({errors:errors.array()});

                             }
                             const{
                                 title,
                                 company,
                                 location,
                                 from,
                                 to,
                                 current,
                                 description

                             } = req.body;
                             const newExp={
                                 title,
                                 company,
                                 location,
                                 from,
                                 to,
                                 current,
                                 description
                             };
                             try {
                                 const profile = await Profile.findOne({user:req.user.id});
                                 profile.experience.unshift(newExp);
                                 await profile.save();
                                 res.json(profile);

                                 
                             } catch (err) {
                                 console.error(err.message);
                                 res.status(500).send('Server Error');
                             }


         })
         // @route  Delete api/Profile/experience/:exp_id
         // @desc    Delete experience from profile
         // @access Private\
         router.delete('/experience/:exp_id',auth,async(req,res)=>{
             try {
                 const profile = await Profile.findOne({user: req.user.id});

                 // Get remove index
                 const removeIndex = profile.experience.map(item=> item.id).indexOf(req.params.exp_id);
                 profile.experience.splice(removeIndex,1);
                 await profile.save();
                 res.json(profile);
                 
             } catch (err) {
                 console.error(err.message);
                 res.status(500).send('Server Error');
                 
             }
         })
          // @route  PUT api/Profile/Education
         // @desc    Add profile Education
         // @access Private
         router.put('/education',[auth,[
            check('school','school is required').not().isEmpty(),
            check('degree','degree is required').not().isEmpty(),
            check('fieldofstudy','Field of study is required').not().isEmpty(),
            check('from','From date is required').not().isEmpty()
        ]],async(req,res)=>{
            const errors= validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({errors:errors.array()});

                            }
                            const{
                                school,
                                degree,
                                fieldofstudy,
                                from,
                                to,
                                current,
                                description

                            } = req.body;
                            const newEdu={
                                school,
                                degree,
                                fieldofstudy,
                                from,
                                to,
                                current,
                                description
                            };
                            try {
                                const profile = await Profile.findOne({user:req.user.id});
                                profile.education.unshift(newEdu);
                                await profile.save();
                                res.json(profile);

                                
                            } catch (err) {
                                console.error(err.message);
                                res.status(500).send('Server Error');
                            }


        })
        // @route  Delete api/Profile/education/:exp_id
        // @desc    Delete education from profile
        // @access Private\
        router.delete('/education/:edu_id',auth,async(req,res)=>{
            try {
                const profile = await Profile.findOne({user: req.user.id});

                // Get remove index
                const removeIndex = profile.experience.map(item=> item.id).indexOf(req.params.edu_id);
                profile.education .splice(removeIndex,1);
                await profile.save();
                res.json(profile);
                
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
                
            }
        })
        // @route  Get api/Profile/github/:username
        // @desc    Get user repos from Github
        // @access Public
        router.get('/github/:username',(req,res)=>{
            try {
                const options ={
                    uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
                    method:'GET',
                    headers: {'user-agent': 'node.js'}
                };
                request(options,(error,response,body)=>{
                    if(error) console.error(error);
                    if(response.statusCode!==200){
                        res.status(404).json({msg:'no git'});
                    }
                    
                    res.json(JSON.parse(body));
                })
                
            } catch (err) {
                console.error(err.message);
                res.status(500).send('server Error')
                
            }
        })
      




    

 module.exports= router;
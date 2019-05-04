"use strict";

const Joi = require("joi");
const AWS = require('aws-sdk');

const capitalizeName = name => name[0].toUpperCase() + name.substring(1).toLowerCase();

const albumBucketName = 'apprentice-2019-profile-pictures';
const albumName = 'profile-photos';
const bucketRegion = 'us-east-1';
const profileURLBase = "https://apprentice-2019-profile-pictures.s3.amazonaws.com/"
const creds = new AWS.Credentials({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
AWS.config.update({
  region: bucketRegion,
  credentials: creds
});
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName},
  Credentials: creds
});

module.exports = app => {
  // Schema for user info validation
  let userSchema = Joi.object().keys({
    first_name: Joi.string().allow(""),
    last_name: Joi.string().allow(""),
    school: Joi.string().allow(""),
    profile_picture: Joi.boolean(),
    majors: Joi.array().items(Joi.string()),
    minors: Joi.array().items(Joi.string()),
    graduation_year: Joi.number().min(0).max(9999),
    interests: Joi.array().items(Joi.string()),
    classes_tutor: Joi.array(),
    classes_learn: Joi.array(),
    phone: Joi.string().min(10).max(10),
    //email: Joi.string().email().required(),
    email: Joi.string().email(),
    blurb: Joi.string().max(120),
    //rating: Joi.array()
    avgRating: Joi.number()
  });

  /**
   * create a new user
   *
   * @param first_name
   * @param last_name
   * @param school
   * @param profile_picture
   * @param majors
   * @param minors
   * @param graduation_year
   * @param interests
   * @param classes_tutor
   * @param classes_learn
   * @param phone
   * @param email
   * @param blurb
   * @param rating
   *
   * @param 'req.body.classes_tutor' and 'req.body.classes_learn' should be an array
   * of course_ids, like ["cs1101","cs2201"]. The api will automatically transfer
   * them into "id" of corresponding classes in database.
   *
   * @return 201 with necessary info (if needed, currently name and email) if succeeds
   * @return 400 if fails
   */
  app.post("/v1/user", async(req,res) => {
    // Validate user input
    Joi.validate(
      req.body,
      userSchema,
      { stripUnknown: true },
      async (err,data) => {
        if (err) {
          const msg=err.details[0].message;
          console.log(`User.create validation failure: ${msg}`);
          res.status(400).send({error: msg});
        } else {
          // try to create the user
          try {
            //get the '_id' for each class based on req.body.classes (course_id)
            let classes_tutor_id=data.classes_tutor;
            let classes_learn_id=data.classes_learn;

            data.classes_tutor = await classToId(data.classes_tutor);
            data.classes_learn = await classToId(data.classes_learn);

            let user=new app.models.User(data);
            await user.save();

            //insert new user's info into corresponding courses
            await addTutorToClass(classes_tutor_id,user);
            await addStudentToClass(classes_learn_id,user);

            res.status(201).send({
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email
            });
          } catch (err) {
              console.log(err);
              res.status(400).send({ error: err.errors});
          }
        }
      }
    );
  });

  /**
   * get a user's information
   *
   * @param req.params.email - identifier for a user (temporaily email)
   *
   * @return 201 with the user's complete information if succeeds
   * @return 400 if fails
   */
  app.get("/v1/user/:email", async (req,res) => {
    try {
      let email = req.params.email;
      let user = await app.models.User
        .findOne({email: email})
        .populate('classes_tutor',{_id:0, course_id: 1, course_name: 1})
        .populate('classes_learn',{_id:0, course_id: 1, course_name: 1});

      if (!user)
        return res.sendStatus(404);

      user.first_name = capitalizeName(user.first_name);
      user.last_name = capitalizeName(user.last_name);
      user.school = capitalizeName(user.school);

      res.status(201).send(user);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.errors});
    }
  });

  /**
   * search for users by email
   *
   * @param req.params.email - identifier for a user (temporaily email)
   *
   * @return 201 with the user's complete information if succeeds
   * @return 400 if fails
   */
  app.get("/v1/user/searchByEmail/:email", async (req,res) => {
    try {
      let email = req.params.email;
      let users = await app.models.User
        .find({email: {$regex: '^'+email+'.*', $options: 'si'}})
        .populate('classes_tutor',{_id:0, course_id: 1, course_name: 1})
        .populate('classes_learn',{_id:0, course_id: 1, course_name: 1});

      res.status(201).send(users);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.errors});
    }
  });

  /**
   * update a user's information
   *
   * @param 'req.body.classes_tutor' and 'req.body.classes_learn' should be an array
   * of course_ids, like ["cs1101","cs2201"]. The api will automatically transfer
   * them into "id" of corresponding classes in database.
   * @req.param.email since we don't have SSO log in/ log out at the moment,
   * we temporarily use email as an id for current user.
   *
   * @return 204 if succeeds
   * @return 400 if fails
   */
  app.put("/v1/user/:email", async (req,res) => {
    Joi.validate(
      req.body,
      userSchema,
      { stripUnknown: true },
      async (err,data) => {
        if(err) {
          const msg = err.details[0].message;
          console.log(`User.update validation failure: ${msg}`);
          res.status(400).send({ error: msg });
        } else {
          // try to update user profile
          try {
            let newTutorCourseIdList = data.classes_tutor;
            let newStudentCourseIdList = data.classes_learn;
            let user = await app.models.User.findOne({ email: req.params.email });

            if (data.classes_tutor !== undefined) {
              await deleteTutorFromClass(user.classes_tutor, user);

              let resList_tutor = await
              classToId(data.classes_tutor);
              data.classes_tutor = resList_tutor;
            }
            if (data.classes_learn !== undefined) {
              await deleteStudentFromClass(user.classes_learn, user);

              let resList_learn = await
              classToId(data.classes_learn);
              data.classes_learn = resList_learn;
            }

            //update user model
            let query = { email: req.params.email };
            user = await
            app.models.User.findOneAndUpdate(
              query,
              { $set: data },
              { new: true }
            );

            //update class model - add user info to updated courses
            await addTutorToClass(newTutorCourseIdList, user);
            await addStudentToClass(newStudentCourseIdList, user);

            res.status(204).end();
          } catch (err) {
              console.log(err);
              res.status(400).send({ error: err.errors });
          }
        }
      }
    );
  });

  /**
   * delete a specific class from a user's 'classes_tutor' or 'classes_learn'
   *
   * @req.params.email: user's email
   * @req.body.course_id: course to delete
   * @req.body.type: 'classes_tutor' or 'classes_learn'
   *
   * @return 204 if succeeds
   * @return 400 if fails
   */
  app.put("/v1/user/deleteClass/:email", async (req,res) => {
    try {
      //verification
      if (req.params.email === undefined
        || req.body.course_id === undefined
        || (req.body.type !== 'classes_tutor' && req.body.type !== 'classes_learn')) {
        res.status(400).send({ error: `req.body is invalid` });

      } else {
        let user = await app.models.User.findOne({ email: req.params.email });
        let course_objectId = (await classToId([req.body.course_id]))[0];

        if (req.body.type === 'classes_tutor') {
          //update User model
          user = await app.models.User.findOneAndUpdate(
            { email: req.params.email },
            { $pull: { classes_tutor: course_objectId } },
            { new: true }
          );
          //update Class model
          await deleteTutorFromClass([course_objectId], user);

        } else {
          //update User model
          user = await app.models.User.findOneAndUpdate(
            { email: req.params.email },
            { $pull: { classes_learn: course_objectId } },
            { new: true }
          );
          //update Class model
          await deleteStudentFromClass([course_objectId], user);

        }
        res.status(204).send();
      }
    }catch (err) {
      res.status(400).send(err);
    }
  });

  /**
   * delete a user
   *
   * @req.params.email since we don't have SSO log in/ log out at the moment,
   * we temporarily use email as an id for current user.
   *
   * @return 204 if succeeds
   * @return 400 if fails
   */
  app.delete("/v1/user/:email", async (req,res) => {
    try {
      //delete user's info from all related Class models
      let user = await app.models.User.findOne({email: req.params.email});
      await deleteTutorFromClass(user.classes_tutor,user);
      await deleteStudentFromClass(user.classes_learn,user);

      //delete User model
      await app.models.User.findOneAndRemove(
        { email: req.params.email }
      );
      res.status(204).end();
    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });

  /**
   * search tutor by name
   * @req.params.filter - search keyword
   *
   * @returns 201 (first_name,last_name,profile_picture,majors,rating) if succeeds
   * @returns 400 if fails
   */
  app.get("/v1/user/searchTutorByName/:filter", async(req,res) => {
    try {
      let filters=req.params.filter.split(' ');
      if (filters.length===1) {
        // search by either first or last name
        let resultList=await app.models.User
          .find(
            {$or:
              [{first_name: {$regex: filters[0]+'.*', $options: 'si'}},
                {last_name: {$regex: filters[0]+'.*', $options: 'si'}}],
              classes_tutor: {$exists: true, $not: {$size: 0}}
              },
            'first_name last_name profile_picture majors avgRating email',
            {
              sort:{first_name: 1}
            }
          );
        res.status(201).send(resultList);

      } else if (filters.length===2) {
        // search by both first and last name
        let resultList=await app.models.User
          .find(
            {
              first_name: {$regex: filters[0]+'.*', $options: 'si'},
              last_name: {$regex: filters[1]+'.*', $options: 'si'},
              classes_tutor: {$exists: true, $not: {$size: 0}}
            },
            'first_name last_name profile_picture majors avgRating email',
            {
              sort:{first_name: 1}
            }
          );
        res.status(201).send(resultList);

      } else {
        // input search keyword is not in correct format
        res.status(400).send({error: `search keyword(s) has incorrect format`});
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });

  /**
   * function - interpret class_id list to corresponding list of object_id in database
   */
  const classToId = async (idList) => {
    let resList=[];
    if (idList===undefined) {return resList;}

    for (let i=0;i<idList.length;i++) {
      let objectId=await app.models.Class
        .findOne({course_id: idList[i]})
        .select('_id');

      if (objectId)
        resList.push(objectId._id);
    }
    return resList;
  };

  /**
   * addTutorToClass()
   * @param classList
   * @param tutor
   */
  const addTutorToClass = async (classList,tutor) => {
    if (classList===undefined) {return;}

    for (let i=0;i<classList.length;i++) {
      let query = { course_id: classList[i] };
      await app.models.Class.findOneAndUpdate(
        query,
        { $push: {tutors: tutor} },
        { new: true}
      );
    }
  };

  /**
   * addStudentToClass()
   * @param classList
   * @param student
   */
  const addStudentToClass = async (classList,student) => {
    if (classList===undefined) {return;}

    for (let i=0;i<classList.length;i++) {
      let query = { course_id: classList[i] };
      await app.models.Class.findOneAndUpdate(
        query,
        { $push: {students: student} },
        { new: true}
      );
    }
  };

  /**
   * deleteTutorFromClass()
   * @param classList
   * @param tutor
   */
  const deleteTutorFromClass = async (classList,tutor) => {
    if (classList===undefined) {return;}

    for (let i=0;i<classList.length;i++) {
      let query = { _id: classList[i] };
      await app.models.Class.update(
        query,
        { $pull: {tutors: tutor._id} },
        { new: true}
      );
    }
  };

  /**
   * deleteStudentFromClass()
   * @param classList
   * @param student
   */
  const deleteStudentFromClass = async (classList,student) => {
    if (classList===undefined) {return;}

    for (let i=0;i<classList.length;i++) {
      let query = { _id: classList[i] };
      await app.models.Class.findOneAndUpdate(
        query,
        { $pull: {students: student._id} },
        { new: true}
      );
    }
  };

  app.get("/v1/user/:email/signUploadProfilePhotoURL/", async (req,res) => {
    let fileName = req.params.email;
    let albumPhotosKey = encodeURIComponent(albumName) + '/';
  
    let photoKey = albumPhotosKey + fileName;
    console.log(photoKey);
    s3.getSignedUrl('putObject', {
      Bucket: albumBucketName,
      Expires: 60*60,
      Key: photoKey,
      ContentType: 'image/jpeg'
    }, function (err, signedURL) {
      if(err){
        console.log(err);
        res.status(400).send({err: err});
      } else {
        res.status(201).send({"signedURL": signedURL});
      }
    });
  });

  app.get("/v1/user/:email/signGetProfilePhotoURL/", async (req,res) => {
    let fileName = req.params.email;
    let albumPhotosKey = encodeURIComponent(albumName) + '/';
  
    let photoKey = albumPhotosKey + fileName;
    s3.getSignedUrl('getObject', {
      Bucket: albumBucketName,
      Expires: 60*60,
      Key: photoKey
    }, function (err, signedURL) {
      if(err){
        console.log(err);
        res.status(400).send({err: err});
      } else {
        res.status(201).send({"signedURL": signedURL});
      }
    });
  });
  
  /**
   * req.params expects ?upload=[true/false]
   */
  app.put("/v1/user/:email/profilePhoto", async (req,res) => {
    try{
      if(req.query.hasOwnProperty("upload")){
        let query = { email: req.params.email };
        await app.models.User.findOneAndUpdate(
          query,
          { $set: {'profile_picture': req.query.upload} },
          { new: true }
        );
        res.status(200).end();
      } else {
        // no parameter provided, must provide paramter
        res.status(400).send({err: "no parameters provided"});
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({err: err});
    }
    
  });
  
};



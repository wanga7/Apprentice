"use strict";

const Joi = require("joi");

const validatePromise = (data,schema,options) => {
  return new Promise((resolve,reject) => {
    Joi.validate(data,schema,options,(err,data) => {
      if (err)
        reject(err);
      else
        resolve(data);
    })
  })
};

module.exports = app => {
  // schema for course informaiton
  let courseSchema = Joi.object().keys({
    course_id: Joi.string().lowercase().alphanum().trim().max(20).required(),
    course_name: Joi.string().lowercase().max(120).required()
  });

  /**
   * create a list of new classes
   * @req.body[].course_id - course id
   * @req.body[].course_name - course name
   *
   * @return 201 if succeeds
   * @return 400 if fails
   */
  app.post("/v1/class", async (req,res) => {
    try {
      if (req.body.length===undefined) {
        console.log('req.body is not an array of courses: ',req.body);
        res.status(400).send();
      } else {
        for (let i=0;i<req.body.length;i++) {
          try {
            let data = await validatePromise(req.body[i],courseSchema,{stripUnknown: true});
            let clas=new app.models.Class(data);
            await clas.save();
          } catch (err) {
            const msg = err.details[0].message;
            console.log(`Course.create validation failure: ${msg}`);
            res.status(400).send({error: msg});
          }
        }
        res.status(201).send({
          msg: `${req.body.length} courses were successfully added.`
        });
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.errors});
    }
  });

  /**
   * get the basic information of a class
   * @req.params.course_id - course id
   *
   * @return 201 with {course_id and course_name} if succeeds
   * @return 400 if fails
   */
  app.get("/v1/class/:course_id", async(req,res) => {
    try {
      let course_id = req.params.course_id;
      let clas = await app.models.Class
        .findOne({course_id: course_id});
      res.status(201).send({
        course_id: clas.course_id,
        course_name: clas.course_name
      });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.errors});
    }
  });

  /**
   * get list of students for a class
   * @req.params.course_id - course id
   *
   * @return 201 with {students (a list of students taking the course)} if succeeds
   * @return 400 if fails
   */
  app.get("/v1/class/:course_id/students", async(req,res) => {
    try {
      let course_id = req.params.course_id;
      let clas = await app.models.Class
        .findOne({course_id: course_id})
        .populate('students');
      res.status(201).send({
        students: clas.students
      })
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.errors});
    }
  });

  /**
   * get list of tutors for a class
   * @req.params.course_id - course id
   *
   * @return 201 with {tutors (a list of tutors for the course)} if succeeds
   * @return 400 if fails
   */
  app.get("/v1/class/:course_id/tutorsById", async(req,res) => {
    try {
      let course_id = req.params.course_id;
      let classes = await app.models.Class
        .find(
          {course_id: {$regex: course_id+'.*', $options: 'si'}},
          )
        .populate('tutors');

      let tutors = classes.reduce((tutors, c) => tutors.concat(c.tutors), []);
      let unique_tutors = tutors.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      });
      res.status(201).send({
        tutors: unique_tutors
      })
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.errors});
    }
  });

  /**
   * get list of tutors for a class
   * @req.params.course_name - course name
   *
   * @return 201 with {tutors (a list of tutors for the course)} if succeeds
   * @return 400 if fails
   */
  app.get("/v1/class/:course_name/tutorsByCourseName", async(req,res) => {
    try {
      let course_name = req.params.course_name;
      let classes = await app.models.Class
        .find(
          {course_name: {$regex: course_name+'.*', $options: 'si'}},
          )
        .populate('tutors');

      let tutors = classes.reduce((tutors, c) => tutors.concat(c.tutors), []);
      let unique_tutors = tutors.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
      });
      res.status(201).send({
        tutors: unique_tutors
      })
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.errors});
    }
  });

  /**
   * search class by course_id
   * @req.params.filter - search keyword
   *
   * @returns 201 if succeeds
   * @returns 400 if fails
   */
  app.get("/v1/class/searchById/:filter", async(req,res) => {
    try {
      let filter=req.params.filter+'.*';
      //console.log("filter:",filter);
      let resultList=await app.models.Class
        .find(
          {course_id: {$regex: filter, $options: 'si'}},
          'course_id course_name',
          {
            sort:{course_id: 1}
          }
        );
      res.status(201).send(resultList);
    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });

  /**
   * search class by course_name
   * @req.params.filter - search keyword
   *
   * @returns 201 if succeeds
   * @returns 400 if fails
   */
  app.get("/v1/class/searchByName/:filter", async(req,res) => {
    try {
      let filter=req.params.filter+'.*';
      //console.log("filter:",filter);
      let resultList=await app.models.Class
        .find(
          {course_name: {$regex: filter, $options: 'si'}},
          'course_id course_name',
          {
            sort:{course_id: 1}
          }
        );
      res.status(201).send(resultList);
    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });

  /**
   * update basic information for a class
   * (which means only course_name for now)
   * @req.params.course_id - course id
   *
   * @return 204 if succeeds
   * @return 400 if fails
   */
  app.put("/v1/class/:course_id", async (req,res) => {
    // validate course info
    Joi.validate(
      req.body,
      courseSchema,
      { stripUnknown: true },
      async (err, data) => {
        if (err) {
          const msg = err.details[0].message;
          console.log(`Course.create validation failure: ${msg}`);
          res.status(400).send({error: msg});
        } else {
          // try to update the course info
          try {
            let query = { course_id: req.params.course_id };
            await app.models.Class.findOneAndUpdate(
              query,
              { $set: data },
              { new: true }
            );
            res.status(204).send();
          } catch (err) {
            console.log(err);
            res.status(400).send({error: err.errors});
          }
        }
      }
    );
  });

  /**
   * delete a class
   *
   * 1) we delete a class in case it's invalid, outdated, etc.
   * 2) we also delete the class automatically from all related users' profile
   *    (tutors & students)
   *
   * @req.params.course_id - course id
   *
   * @return 204 if succeeds
   * @return 400 if fails
   */
  app.delete("/v1/class/:course_id", async (req,res) => {
    try {
      let clas=await app.models.Class.findOne({course_id: req.params.course_id});
      await deleteClassFromTutors(clas);
      await deleteClassFromStudents(clas);

      await app.models.Class.findOneAndRemove(
        { course_id: req.params.course_id }
      );
      res.status(204).end();
    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });

  /**
   * deleteClassFromTutor()
   * @param clas (a class model)
   *
   * delete the class from all its tutors' 'classes_tutor'
   */
  const deleteClassFromTutors = async(clas) => {
    if (clas.tutors===undefined) {return;}

    for (let i=0;i<clas.tutors.length;i++) {
      await app.models.User.findOneAndUpdate(
        { _id: clas.tutors[i] },
        { $pull: {classes_tutor: clas._id} },
        { new: true}
      );
    }
  };

  /**
   * deleteClassFromStudent()
   * @param clas (a class model)
   *
   * delete the class from all its students' 'classes_learn'
   */
  const deleteClassFromStudents = async(clas) => {
    if (clas.students===undefined) {return;}

    for (let i=0;i<clas.students.length;i++) {
      await app.models.User.findOneAndUpdate(
        { _id: clas.students[i] },
        { $pull: {classes_learn: clas._id} },
        { new: true}
      );
    }
  };

};
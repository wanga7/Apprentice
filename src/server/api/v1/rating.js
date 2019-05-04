"use strict";

module.exports = app => {
  /**
   * get a tutor's avg rating
   *
   * @param req.params.email - identifier for the tutor
   * @return 201 with the tutor's avgRating and numOfRatings
   *        (if no rating model has been created for the tutor, create one and
   *        return 0)
   * @return 400 if fails
   */
  app.get("/v1/rating/:email",async(req,res) => {
    try {
      let tutorEmail=req.params.email;
      let Rating = await app.models.Rating
        .findOne({tutor_email: tutorEmail});

      if (!Rating) {
        //cannot find a record, create a new record for the tutor
        let initialData={
          tutor_email: tutorEmail,
          ratings: [],
          numOfRatings: 0,
          avgRating: 0
        };
        let newRating = new app.models.Rating(initialData);
        await newRating.save();

        res.status(201).send({
          avgRating: newRating.avgRating,
          numOfRatings: newRating.numOfRatings
        });
      } else {
        res.status(201).send({
          avgRating: Rating.avgRating,
          numOfRatings: Rating.numOfRatings
        });
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });

  /**
   * get a student's rating record for a tutor
   *
   * @param req.params.tutorEmail - tutor's email
   * @param req.params.studentEmail - student's email
   *
   * @return 201 if succeeds (if no record is found, return 0 by default)
   * @return 400 if fails
   */
  app.get("/v1/rating/:tutorEmail/:studentEmail", async (req,res) => {
    try {
      let tutorEmail=req.params.tutorEmail;
      let studentEmail=req.params.studentEmail;
      let Rating = await app.models.Rating
        .findOne({tutor_email: tutorEmail});

      console.log('Rating: ',Rating);
      console.log('studentEmail: ',studentEmail);
      if (!Rating) {
        res.status(201).send({rating: 0});
      } else {
        for (let i=0;i<Rating.ratings.length;i++) {
          console.log(i,Rating.ratings[i].student_email);
          if (Rating.ratings[i].student_email===studentEmail) {
            res.status(201).send({rating: Rating.ratings[i].value});
            return;
          }
        }
        res.status(201).send({rating: 0});
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });

  /**
   * update a student's rating for a tutor
   *
   * @param req.params.email - tutor's email
   * @param req.body.studentEmail - student's email
   * @param req.body.rating - student's new rating for the tutor
   *
   * @return 201 if succeeds
   *          (if the tutor does not have a rating record yet, create one.)
   *          (if the student hasn't rated the tutor before, add his/ her rating;
   *          if the student has rated the tutor before, replace his/ her old rating.)
   * @return 400 if fails
   */
  app.put("/v1/rating/:email", async (req,res) => {
    try {
      let tutorEmail=req.params.email;
      let Rating = await app.models.Rating
        .findOne({tutor_email: tutorEmail});

      if (!Rating) {
        //cannot find a record, create a new record for the tutor
        let initialData={
          tutor_email: tutorEmail,
          ratings: [],
          numOfRatings: 0,
          avgRating: 0
        };
        Rating = new app.models.Rating(initialData);
        await Rating.save();
      }

      let studentEmail=req.body.studentEmail;
      let newRating=Number(req.body.rating);
      let ratingArr=Rating.ratings;
      let avgRating=Rating.avgRating;
      let numOfRatings=Rating.numOfRatings;
      let flag_exist=false;

      for (let i=0;i<ratingArr.length;i++) {
        if (ratingArr[i].student_email===studentEmail) {
          //an old rating exists, replace it with the new rating
          let oldRating=ratingArr[i].value;
          ratingArr[i].value=newRating;
          avgRating=(avgRating*numOfRatings-oldRating+newRating)/numOfRatings;
          flag_exist=true;
          break;
        }
      }
      if (!flag_exist) {
        ratingArr.push({
          student_email: studentEmail,
          value: newRating
        });
        avgRating=(avgRating*numOfRatings+newRating)/(numOfRatings+1);
        numOfRatings=numOfRatings+1;
      }

      //update database
      await app.models.Rating.findOneAndUpdate(
        { tutor_email: tutorEmail},
        { $set: {
            ratings: ratingArr,
            numOfRatings: numOfRatings,
            avgRating: avgRating
          }
        },
        { new: true }
      );
      await app.models.User.findOneAndUpdate(
        { email: tutorEmail},
        { $set: {
            avgRating: avgRating
          }
        },
        { new: true }
      );

      res.status(201).send();

    } catch (err) {
      console.log(err);
      res.status(400).send({error: err.errors});
    }
  });
};
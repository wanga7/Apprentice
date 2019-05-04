# Apprentice
(introduction)
# APIs
**/auth:**


**/v1/class:**
- `POST /v1/class`
	- create a list of new classes
	- `@param req.body[].course_id` - course id
	- `@param req.body[].course_name` - course name
	- `@return 201` if succeeds
	- `@return 400` if fails
- `GET /v1/class/:course_id`
	- get the basic information of a course
	- `@param req.params.course_id` - course id
	- `@return 201` with {course_id, course_name} if succeeds
	- `@return 400` if fails
- `GET /v1/class/:course_id/students`
	- get list of students for a course
	- `@param req.params.course_id` - course id
	- `@return 201` with {students (a list of students taking the course)} if succeeds
	- `@return 400` if fails
- `GET /v1/class/:course_id/tutorsById`
	- get list of tutors for a course
	- `@param req.params.course_id`  - course id
	- `@return 201` with {tutors (a list of tutors for the course)} if succeeds
	- `@return 400` if fails
- `GET /v1/class/:course_name/tutorsByCourseName`
	- get list of tutors for a course
	- `@param req.params.course_name` - course name
	- `@return 201` with {tutors (a list of tutors for the course)} if succeeds
	- `@return 400` if fails
- `GET /v1/class/searchById/:filter`
	- search course by course id
	- `@param req.params.filter` - search keyword
	- `@return 201` if succeeds
	- `@return 400` if fails
- `GET /v1/class/searchByName/:filter`
	- search course by course name
	- `@param req.params.filter` - search keyword
	- `@return 201` if succeeds
	- `@reutrn 400` if fails
- `PUT /v1/class/:course_id`
	- update basic information for a course
	- `@param req.params.course_id` - course_id
	- `@return 204` if succeeds
	- `@return 400` if fails
- `DELETE /v1/class/:course_id`
	- delete a course in case it is invalid, outdated, etc.
	- also delete the course from all related users' profile (tutors & students)
	- `@param req.params.course_id` - course id
	- `@return 204` if succeeds
	- `@return 400` if fails

**/v1/connection:**


**/v1/message:**


**/v1/rating:**
- `GET /v1/rating/:email`
	- get a tutor's average rating
	- `@param req.params.email` - identifier for the tutor
	- `@return 201` with the tutor's avgRating and numOfRatings (if no rating model has been created for the tutor, create one and return 0)
	- `return 400` if fails
- `GET /v1/rating/:tutorEmail/:studentEmail`
	- get a student's rating record for a tutor
	- `@param req.params.tutorEmail` - tutor's email
	- `@param req.params.studentEmail` - student's email
	- `return 201` if succeeds (if no record is found, return 0 by default)
	- `return 400` if fails
- `PUT /v1/rating/:email`
	- update a student's rating for a tutor
	- `@param req.params.email` - tutor's email
	- `@param req.body.studentEmail` - student's email
	- `@param req.body.rating` - student's new rating for the tutor
	- `@return 201` if succeeds
		- if the tutor does not have a rating record yet, create one
		- if the student has not rated the tutor before, add his/ her rating
		- if the student has rated the tutor before, replace his/ her previous rating
	- `@return 400` if fails

**/v1/session:**


**/v1/user:**
- `POST /v1/user`
	- create a new user
	- `@param first_name, last_name, school, profile_picture, majors, minors, graduation_year, interests, classes_tutor, classes_learn, phone, email, blurb`
	- `@return 201` if succeeds
	- `@return 400` if fails
- `GET /v1/user/:email`
	- get a user's information
	- `@param req.params.email` - identifier for a user
	- `@return 201` with the user's complete information if succeeds
	- `@return 400` if fails
- `GET /v1/user/searchByEmail/:email`
	- search for users by email
	- `@param req.params.email` - identifier for a user
	- `@return 201` with the user's complete information if succeeds
	- `@return 400` if fails
- `PUT /v1/user/:email`
	- update a user's information
	- `@return 204` if succeeds
	- `@return 400` if fails
- `PUT /v1/user/deleteClass/:email`
	- delete a specific course from a user's 'classes_tutor' or 'classes_learn'
	- `@req.params.email` user's email
	- `@req.body.course_id` course to delete
	- `@req.body.type` 'classes_tutor' or 'classes_learn'
	- `@return 204` if succeeds
	- `@return 400` if fails
- `DELETE /v1/user/:email`
	- delete a user
	- `@param req.params.email` identifier for the user
	- `@return 204` if succeeds
	- `@return 400` if fails
- `GET /v1/user/searchTutorByName/:filter`
	- search tutor by name
	- `@req.params.filter` - search keyword
	- `@return 201` with {first_name, last_name, profile_picture, majors} if succeeds
	- `@return 400` if fails
- `GET /v1/user/:email/signUploadProfilePhotoURL`
	- ...
- `GET /v1/user/:email/signGetProfilePhotoURL`
	- ...
- `PUT /v1/user/:email/profilePhoto`
	- ...

# Data Schemas
**Class:**
- `course_id` String, required, unique
- `course_name` String, required
- `students` an array of references to **User**

**Connection:**


**Message:**


**Rating:**
- `tutor_email` String, required, unique
- `ratings` an array of Objects `{student_email: String, value: Number}`
- `numOfRatings` Number
- `avgRating` Number

**User:**
- `first_name` String, required
- `last_name` String, required
- `school` String, required
- `profile_picture` Boolean
- `majors` an array of String
- `minors` an array of String
- `graduation_year` Number
- `interests` String
- `classes_tutor` an array of references to **Class**
- `classes_learn` an array of references to **Class**
- `phone` String
- `email` String
- `blurb` String
- `avgRating` Number
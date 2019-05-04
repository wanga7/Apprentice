const courses = require('./classes');
const ObjectSet = require('custom-object-set');

const getRandomCourses = numberOfCourses => {
  let i=0;
  let randomCourses = new ObjectSet();
  while (i < numberOfCourses) {
    let course = courses[Math.floor(Math.random() * courses.length)];
    if (!randomCourses.has(course)){
      randomCourses.add(course);
      ++i;
    }
  }

  return randomCourses.map(course => course.course_id);
};

module.exports = [
  {
    first_name: 'bailey',
    last_name: 'pearson',
    school: 'vanderbilt',
    profile_picture: true,
    majors: ['computer science'],
    minors: [],
    graduation_year: 2019,
    interests: ['coffee','camping','reading'],
    phone: '1234567890',
    email: 'bailey.pearson@vanderbilt.edu',
    blurb: 'coding is fun',
    // rating: [1],
    classes_tutor: getRandomCourses(3),
    classes_learn: getRandomCourses(0),
  },
  {
    first_name: 'jesse',
    last_name: 'seales',
    school: 'vanderbilt',
    profile_picture: true,
    majors: ['computer science'],
    minors: ['math'],
    graduation_year: 2019,
    interests: ['capital one','absinthe'],
    phone: '1234567890',
    email: 'jesse.d.seales@vanderbilt.edu',
    blurb: 'bailey is awesome',
    // rating: [],
    classes_tutor: getRandomCourses(1),
    classes_learn: getRandomCourses(2),
  },
  {
    first_name: 'anjie',
    last_name: 'wang',
    school: 'vanderbilt',
    profile_picture: true,
    majors: ['computer science'],
    minors: [],
    graduation_year: 2020,
    interests: ['coding'],
    phone: '1234567890',
    email: 'anjie.wang@vanderbilt.edu',
    blurb: 'Did you know bananas are nutritous AND convenient?',
    // rating: [5,2,1,4,4],
    classes_tutor: getRandomCourses(4),
    classes_learn: getRandomCourses(0),
  },
  {
    first_name: 'alec',
    last_name: 'jotte',
    school: 'vanderbilt',
    profile_picture: false,
    majors: ['biology'],
    minors: [],
    graduation_year: 2020,
    interests: ['working out','running'],
    phone: '1234567890',
    email: 'alec.jotte@vanderbilt.edu',
    blurb: 'I eat, I sleep, I win',
    // rating: [5,2,1,4,4],
    classes_tutor: getRandomCourses(8),
    classes_learn: getRandomCourses(3),
  },
  {
    first_name: 'eric',
    last_name: 'yeats',
    school: 'vanderbilt',
    profile_picture: false,
    majors: ['computer engineering'],
    minors: ['neuroscience'],
    graduation_year: 2020,
    interests: ['game of thrones'],
    phone: '1234567890',
    email: 'eric.yeats@vanderbilt.edu',
    blurb: 'La Croix is awesome',
    // rating: [5,2,1,4,4],
    classes_tutor: getRandomCourses(8),
    classes_learn: getRandomCourses(3),
  },
  {
    first_name: 'joe',
    last_name: 'eilbert',
    school: 'vanderbilt',
    profile_picture: false,
    majors: ['physics','art history'],
    minors: [],
    graduation_year: 2020,
    interests: ['franzia','euchre'],
    phone: '1234567890',
    email: 'joe.eilbert@vanderbilt.edu',
    blurb: 'Bananas baby',
    // rating: [5,2,1,4,4],
    classes_tutor: getRandomCourses(4),
    classes_learn: getRandomCourses(0),
  },
];

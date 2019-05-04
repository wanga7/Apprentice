/**
 *  eventual module to create vCards
 */

const vcard = require('vcards-js');
const request = require('request-promise-native');

const fetchUser = async email => request.get(
  `http://localhost:8080/v1/user/${email}`,
  {
    json: true
  });

const makeVCard = async email => {
  try {
    const user = await fetchUser(email);

    const card = vcard();

    //set properties
    card.firstName = user.first_name;
    card.lastName = user.last_name;
    card.organization = user.school;
    // vCard.photo.attachFromUrl('https://avatars2.githubusercontent.com/u/5659221?v=3&s=460', 'JPEG');
    card.workPhone = user.phone;
    card.title = 'Apprentice Tutor';
    card.note = user.blurb;

    card.saveToFile(`./public/${user.email}.vcf`);

  } catch (err) {
    console.error(err);
  }
};

module.exports = makeVCard;
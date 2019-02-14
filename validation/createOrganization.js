const Validator = require("validator");
const isEmpty = require("./is-empty");

const industriesList = [
  "Электроэнергетика",
  "Нефтедобывающая промышленность",
  "Нефтеперерабатывающая промышленность",
  "Газовая промышленность",
  "Угольная промышленность",
  "Сланцевая промышленность",
  "Торфяная промышленность",
  "Черная металлургия",
  "Цветная металлургия",
  "Химическая и нефтехимическая промышленность",
  "Машиностроение",
  "Деревообрабатывающая промышленность",
  "Промышленность строительных материалов",
  "Стекольная и фарфоро - фаянсовая промышленность",
  "Легкая промышленность",
  "Пищевая промышленность",
  "Микробиологическая промышленность",
  "Мукомольно - крупяная промышленность",
  "Медицинская промышленность",
  "Полиграфическая промышленность",
  "Другие промышленные производства"
];

const asperantoTypes = [
  "Производитель",
  "Разработчик",
  "Логистическая компания",
  "Инвестор"
];

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.businessType = !isEmpty(data.businessType) ? data.businessType : "";
  data.countryOfIncorporation = !isEmpty(data.countryOfIncorporation)
    ? data.countryOfIncorporation
    : "";
  data.industries = !isEmpty(data.industries) ? data.industries : "";
  data.type = !isEmpty(data.type) ? data.type : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is reqired";
  }
  if (Validator.isEmpty(data.businessType)) {
    errors.businessType = "Business type field is reqired";
  }
  if (Validator.isEmpty(data.countryOfIncorporation)) {
    errors.countryOfIncorporation = "Country of incorporation field is reqired";
  }
  if (Validator.isEmpty(data.industries)) {
    errors.industries = "Industries field is reqired";
  } else {
    for (let industry of data.industries.split(",")) {
      if (!industriesList.includes(industry)) {
        errors.industries = "Unknown industry";
      }
    }
  }
  if (Validator.isEmpty(data.type)) {
    errors.type = "Type field is reqired";
  } else {
    for (let type of data.type.split(",")) {
      if (!asperantoTypes.includes(type)) {
        errors.type = "Unknown type";
      }
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

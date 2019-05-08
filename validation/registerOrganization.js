const Validator = require("validator");
const isEmpty = require("./is-empty");

const industriesList = [
  "Электроэнергетика",
  "Нефтегазовая промышленность",
  "Нефтедобывающая промышленность",
  "Нефтеперерабатывающая промышленность",
  "Газовая промышленность",
  "Угольная промышленность",
  "Сланцевая промышленность",
  "Торфяная промышленность",
  "Металлургическая промышленность",
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
  "Медицинская промышленность",
  "Полиграфическая промышленность",
  "Авиационная промышленность",
  "Космическая промышленность",
  "Сельскохозяйственная промышленность",
  "Горнодобывающая промышленность",
  "Другие промышленные производства"
];

const asperantoTypes = [
  "MANUFACTURER",
  "CUSTOMER",
  "LOGISTICIAN",
  "SERVICEMAN"
];

module.exports = function validateRegisterOrgInput(data) {
  let errors = {};
  // User fields
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.middleName = !isEmpty(data.middleName) ? data.middleName : "";
  data.nickname = !isEmpty(data.nickname) ? data.nickname : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  // Organization fields
  data.orgName = !isEmpty(data.orgName) ? data.orgName : "";
  data.businessType = !isEmpty(data.businessType) ? data.businessType : "";
  data.countryOfIncorporation = !isEmpty(data.countryOfIncorporation)
    ? data.countryOfIncorporation
    : "";
  data.industries = !isEmpty(data.industries) ? data.industries : "";
  data.asperantoTypes = !isEmpty(data.asperantoTypes)
    ? data.asperantoTypes
    : "";
  data.urlName = !isEmpty(data.urlName) ? data.urlName : "";

  //
  // User fields
  //
  if (!Validator.isLength(data.firstName, { min: 2, max: 50 })) {
    // errors.firstName = "First name must be between 2 and 50 characters";
    errors.firstName = "Имя должно содержать от 2ух до 50 символов";
  }
  if (!Validator.isLength(data.lastName, { min: 2, max: 50 })) {
    // errors.lastName = "Last name must be between 2 and 50 characters";
    errors.lastName = "Фамилия должна содержать от 2ух до 50 символов";
  }
  if (!Validator.isLength(data.middleName, { min: 2, max: 50 })) {
    // errors.middleName = "Middle name must be between 2 and 50 characters";
    errors.middleName = "Отчество должно содержать от 2ух до 50 символов";
  }
  if (!Validator.isLength(data.nickname, { min: 2, max: 50 })) {
    // errors.nickname = "Nickname must be between 2 and 50 characters";
    errors.nickname = "Никнейм должен содержать от 2ух до 50 символов";
  }

  if (Validator.isEmpty(data.firstName)) {
    // errors.firstName = "First name field is reqired";
    errors.firstName = "Необходимо заполнить поле с именем";
  }
  if (Validator.isEmpty(data.lastName)) {
    // errors.lastName = "Last name field is reqired";
    errors.lastName = "Необходимо заполнить поле с фамилией";
  }
  if (Validator.isEmpty(data.middleName)) {
    // errors.middleName = "Middle name field is reqired";
    errors.middleName = "Необходимо заполнить поле с отчеством";
  }
  if (Validator.isEmpty(data.nickname)) {
    // errors.nickname = "Nickname field is reqired";
    errors.nickname = "Необходимо заполнить поле с никнеймом";
  }

  if (!Validator.isEmail(data.email)) {
    // errors.email = "Email is invalid";
    errors.email = "Поле email заполнено некорректно";
  }
  if (Validator.isEmpty(data.email)) {
    // errors.email = "Email field is reqired";
    errors.email = "Необходимо заполнить поле с email";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    // errors.password = "Password must be ay least 6 characters";
    errors.password = "Пароль должен содержать хотя бы 6 символов";
  }
  if (Validator.isEmpty(data.password)) {
    // errors.password = "Password field is reqired";
    errors.password = "Необходимо заполнить поле с паролем";
  }

  if (!Validator.equals(data.password, data.password2)) {
    // errors.password2 = "Passwords must match";
    errors.password2 = "Пароли должны совпадать";
  }
  if (Validator.isEmpty(data.password2)) {
    // errors.password2 = "Confirm password field is reqired";
    errors.password2 = "Необходимо заполнить поле подтверждения пароля";
  }

  //
  // Organization fields
  //
  if (!Validator.isLength(data.orgName, { min: 2, max: 256 })) {
    errors.orgName = "orgName must be between 2 and 256 characters";
  }

  if (Validator.isEmpty(data.orgName)) {
    errors.orgName = "orgName field is reqired";
  }
  if (Validator.isEmpty(data.urlName)) {
    errors.urlName = "Url name field is reqired";
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
  if (!Validator.isEmpty(data.asperantoTypes)) {
    for (let asperantoType of data.asperantoTypes.split(",")) {
      if (!asperantoType.includes(asperantoTypes)) {
        errors.asperantoTypes = "Unknown asperanto types";
      }
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

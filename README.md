### **API dictionary** ###
## Accounts ##
1. **Route:** POST /accounts/register  
**Desc:** Register new user  
**Access:** Public  
**Request params:** Body: [firstName, lastName, middleName, nickname, email, password, password2]  
**Response params:** All user fields or input errors   
  
2. **Route:** POST /accounts/login  
**Desc:** Login user 
**Access:** Public  
**Request params:** Body: [email, password]  
**Response params:** {success : true, token : "Bearer ..."} or errors {email : "...", password : "..."}  
  
3. **Route:** GET api/accounts/profile  
**Desc:** Return current loged user profile  
**Access:** Private  
**Request params:** Header: {Authorization : token}  
**Response params:** All fields of profile or "Unauthorized"  
  
4. **Route:** GET api/accounts/  
**Desc:** Get all accounts  
**Access:** Public  
**Request params:** none  
**Response params:** List of all profiles fields [{firstName : "", middleName : "", lastName : "", nickname : "", avatar : ""}, {...}, ...] or error {nousers : "There are no users yet"}  
  
5. **Route:** GET api/accounts/:nickname  
**Desc:** Get public info about user (profile + some name fields)  
**Access:** Public  
**Request params:** Header: {Authorization : token}  
**Response params:** Profile fields or error {nouser : "User not found"}  
  
  
##Organizations##
1. **Route:** POST /organizations/create  
**Desc:** Create new organization  
**Access:** Private  
**Request params:** Header : {Authorization : token},  
Body: [name, urlName, [industries], businessType, countryOfIncorporation]  
**Response params:** All fields of new Organziation  
  
2. **Route:** GET api/organizations/all  
**Desc:** Get limited info about all organizations
**Access:** Public  
**Request params:** none 
**Response params:** [{name : "", industries : ["", "", ...], type : "", countryOfIncorporation: "",  
registeredFrom : ""}, {...}, ...] or error {organization : "Organizations not found"}  
  
3. **Route:** POST api/organizations/:org_urlname/products/create  
**Desc:** Create new product within organization  
**Access:** Private  
**Request params:** Header: {Authorization : token},  
Body: {name : "", description : "", price : 123, image : ""}  
**Response params:** All product fields or errors  
  
4. **Route:** POST api/organizations/:org_urlname/services/create  
**Desc:** Create new service within organization  
**Access:** Private  
**Request params:** Header: {Authorization : token},  
Body: {name : "", description : "", price : 123, image : ""}  
**Response params:** All service fields or errors  
  
5. **Route:** GET api/organizations/:org_urlname  
**Desc:** Get limited info about organiation  
**Access:** Public  
**Request params:** none  
**Response params:** {name : "", industries : ["","",...], type : "", countryOfIncorporation : "", registeredFrom : "", productsList : [{product fields}, {}, ...], servicesList : [{service fields}, {}, ...]}  
or error {organization : 'Organization not found'}  
  
6. **Route:** GET api/organizations/:org_urlname/private  
**Desc:** Get all info about organiation  
**Access:** Private  
**Request params:** Header: {Authorization : token}  
**Response params:** All organization fields  
  
7. **Route:** POST api/organizations/:org_urlname/products/:prod_id/edit  
**Desc:** Edit product  
**Access:** Private  
**Request params:** Header : {Authorization : token},  
Body : {name : "", image : "", price : 123, description : ""}  
**Response params:** {name : "", image : "", price : 123, description : ""} or errors : {access : "Access denied"},  
{organization : "Organization not found"}, {product : "Product not found"}  
  
8. **Route:** POST api/organizations/:org_urlname/services/:serv_id/edit  
**Desc:** Edit service  
**Access:** Private  
**Request params:** Header : {Authorization : token},  
Body : {name : "", image : "", price : 123, description : ""}  
**Response params:** {name : "", image : "", price : 123, description : ""} or errors : {access : "Access denied"},  
{organization : "Organization not found"}, {service : "Service not found"}  
  
9. **Route:** DELETE api/organizations/:org_urlname/services/:serv_id/delete  
**Desc:** Delete service  
**Access:** Private  
**Request params:** Header : {Authorization : token}  
**Response params:** {msg : "Service successfully deleted"} or errors : {access : "Access denied"},  
{organization : "Organization not found"}, {service : "Service not found"}  
  
10. **Route:** DELETE api/organizations/:org_urlname/products/:prod_id/delete  
**Desc:** Delete product  
**Access:** Private  
**Request params:** Header : {Authorization : token}  
**Response params:** {msg : "Product successfully deleted"} or errors : {access : "Access denied"},  
{organization : "Organization not found"}, {product : "Product not found"}  
  
  
##Products##
1. **Route:** GET api/products  
**Desc:** Get all products  
**Access:** Public  
**Request params:** none  
**Response params:** list of products [{name : "", image : "", price : 123, description : ""}, {...}, ...]  
or error {noproducts : "No products found"}  
  
2. **Route:** GET api/products/:prod_id  
**Desc:** Get info about product  
**Access:** Public  
**Request params:** none  
**Response params:** All product fields or error {product : "Product not found"}  
  
  
##Services##
1. **Route:** GET api/services  
**Desc:** Get all services  
**Access:** Public  
**Request params:** none  
**Response params:** list of services [{name : "", image : "", price : 123, description : ""}, {...}, ...]  
or error {noservices : "No services found"}  
  
2. **Route:** GET api/services/:serv_id  
**Desc:** Get info about service  
**Access:** Public  
**Request params:** none  
**Response params:** All service fields  or error {service : "Service not found"}

# Models for reference
## User model
```
#!javascript
const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  regDate: {
    type: Date,
    default: Date.now()
  }
});
```
## User's profile model 

```
#!javascript
const ProfileSchema = new Schema({
  // User reference
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  // List of companies related to user
  organizations: [
    {
      comId: {
        type: Schema.Types.ObjectId,
        ref: "organizations"
      },
      position: {
        type: String,
        required: true
      },
      corporateEmail: {
        type: String
      },
      from: {
        type: Date,
        default: Date.now()
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      }
    }
  ],
  // List of user contacts
  contacts: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  // List of user's favorite companies, products and servises
  favorites: {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products"
        }
      }
    ],
    companies: [
      {
        company: {
          type: Schema.Types.ObjectId,
          ref: "companies"
        }
      }
    ],
    services: [
      {
        service: {
          type: Schema.ObjectId,
          ref: "services"
        }
      }
    ]
  }
});

```
##Organization model

```
#!javascript
const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  urlName: {
    type: String,
    required: true
    //, default : ???
  },
  // Отрасли в которых задействована компания
  industries: {
    type: [String],
    required: true
  },
  // aperanto-type : [  ]
  asperantoType: {
    type: [String]
  },
  // ПАО, ООО, МИБ ...
  businessType: {
    type: String,
    required: true
  },
  countryOfIncorporation: {
    type: String,
    required: true
  },
  registeredFrom: {
    type: Date,
    default: Date.now()
  },
  productsList: [
    {
      type: Schema.Types.ObjectId,
      ref: "products"
    }
  ],
  servicesList: [
    {
      type: Schema.Types.ObjectId,
      ref: "services"
    }
  ],
  members: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      // Should be a ref
      permissions: {
        type: String,
        required: true
      }
    }
  ]
});

```
##Product model

```
#!javascript

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
    //, default : ???
  },
  description: {
    type: String,
    required: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  tags: {
    type: [String]
  },
  addDate: {
    type: Date,
    default: Date.now()
  }
});
```
##Service model

```
#!javascript
const ServiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  tags: {
    type: [String]
  },
  addDate: {
    type: Date,
    default: Date.now()
  }
});

```

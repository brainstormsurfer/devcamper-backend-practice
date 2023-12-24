import mongoose from "mongoose";
import slugify from "slugify";
import geocoder from "../utils/geocoder.js";

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS",
    ],
  },
  phone: {
    type: String,
    maxlength: [20, "Phone number can not be longer than 20 characters"],
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, "Please add a valid email"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  location: {
    // GeoJSON
    type: {
      type: String,
      enum: ["Point"],
      // required: true
      required: false,
    },
    coordinates: {
      type: [Number],
      // required: true,
      required: false,
      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  careers: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Other",
    ],
  },
  averageRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [10, "Rating must can not be more than 10"],
  },
  averageCost: Number,
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  housing: {
    type: Boolean,
    default: false,
  },
  jobAssistance: {
    type: Boolean,
    default: false,
  },
  jobGuarantee: {
    type: Boolean,
    default: false,
  },
  acceptGi: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create bootcamp slug from the name
BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field
BootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.address = undefined;
  next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('deleteOne',{ document: true, query: false }, async function (next) {
    console.log(`Courses being removed from bootcamp ${this._id}`)
    // once we delete a bootcamp we can access the fields with "this.whateverfield"
    // and then we gonna just match bootcamp in the courses with the id 
    // because in the Course model, the bootcamp's gonna be the ObjectId
    // so it's gonna know to only delete courses for this particular bootcamp
    // (and the approach to the fields despite the deleting is thanks to the "pre")
    await this.model('Course').deleteMany({ bootcamp: this._id })
    next()
  })

// Cascade delete reviews when a bootcamp is deleted
BootcampSchema.pre('deleteOne',{ document: true, query: false }, async function (next) {
    console.log(`Reviews being removed from bootcamp ${this._id}`)
    await this.model('Review').deleteMany({ bootcamp: this._id })
    next()
  })

// Reverse populate with virtual field/attr
BootcampSchema.virtual('courses',{
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false // we want to get a field called "courses" and array of all courses
})

// Reverse populate with virtual field/attr
BootcampSchema.virtual('reviews',{
  ref: 'Review',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false // we want to get a field called "reviews" and array of all reviews
})

export default mongoose.model("Bootcamp", BootcampSchema);




/* 
<< hides id from fronend >>
   transform: function (_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
*/
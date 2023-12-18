import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: Number,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipsAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // console.log("Calculating avg cost...".blue);

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);
  
  // console.log("averageCost", Math.ceil(obj[0].averageCost / 10) * 10)

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      // rounded up with ceil, and then rounded higher to the nearest 10 divider
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverage after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverage before remove
CourseSchema.pre("deleteOne", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

export default mongoose.model("Course", CourseSchema);

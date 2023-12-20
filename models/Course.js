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
CourseSchema.statics.getAverageCost = async function (bootcampId, deletedCourseTuition) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
        courses: { $push: "$_id" } // Push the document IDs into an array
      }
    },
  ]);

  if (obj.length > 0) {
    // If the deletedCourseTuition is provided, subtract it from the aggregate
    if (deletedCourseTuition) {
      const updatedTotalTuition = obj[0].averageCost * obj[0].courses.length - deletedCourseTuition;
      const updatedAverageCost = obj[0].courses.length > 1 ? updatedTotalTuition / (obj[0].courses.length - 1) : 0;
      obj[0].averageCost = updatedAverageCost;
    }

    try {
      await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      });
    } catch (err) {
      console.error(err);
    }
  }
};


// Call getAverage after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before delete
CourseSchema.pre('deleteOne', { document: true }, async function () {
  // Call getAverageCost before deleting the course
  await this.constructor.getAverageCost(this.bootcamp, this.tuition);
});


export default mongoose.model("Course", CourseSchema);

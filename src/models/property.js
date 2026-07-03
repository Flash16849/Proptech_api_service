const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    location: {type: Object, required: true},
    type: {type: String, required: true},
    tags: [String],
    createdDate: {type: Date, default: Date.now}
})

const Property = mongoose.model('Property', propertySchema)

module.exports = Property
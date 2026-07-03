const express = require('express')
const router = express.Router()

const Property = require('../models/property');
const { default: mongoose } = require('mongoose');
// const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
    try{
        const {tags, street, city, minPrice, maxPrice, page, limit} = req.query
        const filter = {}

        const pageNum = Number(page) || 1
        const limitProp = Number(limit) || 10
        const skip = (pageNum - 1) * limitProp

        if(street || city){
            if(street){ filter['location.street'] = street }
            if(city){ filter['location.city'] = city }
        }
        if(tags){
            filter.tags = { $in: tags.split(',') }
        }
        
        if(minPrice && maxPrice && Number(minPrice) > Number(maxPrice)){
            return res.status(400).json({message: "minPrice must be smaller than maxPrice"})
        }
        if(minPrice || maxPrice){
            filter.price = {}
            if(minPrice){ filter.price.$gte = minPrice }
            if(maxPrice){ filter.price.$lte = maxPrice }
        }

        const properties = await Property.find(filter)
            .skip(skip)
            .limit(limitProp)

        const total = await Property.countDocuments(filter)

        res.status(200).json({
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitProp),
            data: properties,
            test: filter
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
});

router.get('/:id', async (req, res) => {
    try{
        const id = req.params.id
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "Invalid ID format"})
        }

        const prop = await Property.findOne({_id: id})

        if(prop === null){
            return res.status(404).json({message: "ID not found"})
        }
        res.json(prop)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
});


router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "Invalid ID format"})
        }

        const prop = await Property.findOneAndUpdate(
            {_id: id},
            {$set: req.body},
            {returnDocument: 'after'}
        )

        //findOneAndUpdate will return null if not found
        if(prop === null){
            return res.status(404).json({message: "ID not found"})
        }

        res.status(200).json(prop)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.post('/', async (req, res) => {
    try {
        const {name, price, location} = req.body
        if(!name || !price || !location){
            return res.status(400).json({message: "Missing required fields"})
        }

        const prop = new Property(req.body)
        await prop.save()
        res.status(201).json(prop)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
    
})

router.delete('/', async (req, res) => {
    try {
        await Property.deleteMany({})
        res.status(200).json("Deleted all")
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "Invalid ID format"})
        }

        const deletedProp = await Property.deleteOne({_id: id})

        //deleteOne would return 0 deletedCount if not found
        if(deletedProp.deletedCount === 0){
            return res.status(404).json({message: "ID not found"})
        }

        res.status(200).json({message: "Deleted successfully"})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})


module.exports = router;
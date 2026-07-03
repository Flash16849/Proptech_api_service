const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


router.get('/', async (req, res) => {
    try{
        const users = await User.find().select('name email')

        res.status(200).json(users)

    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body

        if(!email || !password){
            return res.status(400).json({message: "Missing required fields"})
        }

        const user = await User.findOne({email})
        if(!user) return res.status(401).json({message: "Invalid Credentials"})
        
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(401).json({message: "Invalid Credentials"})

        const token = jwt.sign(
            {id: user.id},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        )

        res.status(200).json({token: token})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.post('/register', async (req, res) => {
    try{
        const {name, email, password} = req.body

        if(!name || !email || !password){
            return res.status(400).json({message: "Missing required fields"})
        }

        const existingUser = await User.findOne({ email })
        if(existingUser) return res.status(409).json({message: "Email already existed"})

        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)

        const user = new User({ name, email, password: hashedPass })
        await user.save()

        res.status(201).json({userEmail: user.email, message: 'User created successfully'})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

module.exports = router
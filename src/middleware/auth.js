const jwt =require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    
    console.log('auth header:', req.headers.authorization)
    const token = req.headers.authorization?.split(' ')[1]
    console.log('token:', token)
    
    if(!token) return res.status(401).json({message: 'No token hah'})
    
    try{
        const decoded = jwt.verify(token, process.env.JWWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({message: 'Invalid token'})
    }
}

module.exports = authMiddleware
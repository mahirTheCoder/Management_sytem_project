const login = (req, res) => {
    try {
        res.status(200).send({message: 'Login successful'}) 
    } catch (error) {
        res.status(500).send({message: 'Login failed'})
    }
}

module.exports = {login} 
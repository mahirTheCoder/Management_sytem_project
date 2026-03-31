const products = (req , res)=>{

    try {
        res.status(200).send({message: 'Products retrieved successfully'})
    } catch (error) {
        res.status(500).send({message: 'Failed to retrieve products'})
    }
}

module.exports = {products}
var express = require('express');
var router = express.Router();
const roles = require('../roles.js');

var dm = require('../sql100.js');
var dn = require('../sqlnss.js');

router.use(express.json());
router.use(express.urlencoded({
  extended: false,
  parameterLimit: 100000,
  limit: '50mb',
}));

router
    .route('/goodslist', roles.sessionCheckMiddleware)
    .get(async (req, res) => {
        try{
            const goodslist = await dm.getGoodsList();
            res.status(200).json({goods: goodslist});
        }catch (error) {
			console.error('Error get goodlist:', error);
			res.status(500).json({message: 'Error when try to get goods list'});
		}
    })

module.exports = router;
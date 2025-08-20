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
    .route('/goodslist')
    .get(roles.sessionCheckMiddleware, async (req, res) => {
        try{
            const goodslist = await dm.getGoodsList();
            res.setHeader("Cache-Control", "no-store");
            res.status(200).json({goods: goodslist});
        }catch (error) {
			console.error('Error get goodlist:', error);
			res.status(500).json({message: 'Error when try to get goods list'});
		}
    })

router
    .route('/goodspricepergram')
    .get(roles.sessionCheckMiddleware, async (req, res) => {
        try{
            const id_item = req.query.id_item;
            const goodsprice = await dm.getGoodsPricePerGram(id_item);
            res.status(200).json({price: goodsprice});
        }catch (error) {
			console.error('Error get good price per gram:', error);
			res.status(500).json({message: 'Error when try to get goods price per gram'});
		}
    })

router
    .route('/countprice')
    .post(roles.sessionCheckMiddleware, async (req, res) => {
        try{
            const cart = req.body.cart;
            const goodsprice = await dm.countPricePerItem(cart);
            res.status(200).json({cart: goodsprice});
        }catch (error) {
			console.error('Error count price:', error);
			res.status(500).json({message: 'Error count price', log: error});
		}
    })
module.exports = router;
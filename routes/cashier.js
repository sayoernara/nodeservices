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

router
    .route('/savetransaction')
    .post(roles.sessionCheckMiddleware, async (req, res) => {
        try{
            const transaction = req.body.transaction;
            const saveSellTransaction = await dm.saveSellTransaction(transaction);
            res.status(200).json({message: saveSellTransaction});
        }catch (error) {
			console.error('Error save transaction:', error);
			res.status(500).json({message: 'Error save transaction', log: error});
		}
    })

router 
    .route('/gettransactionbycashier')
    .get(roles.sessionCheckMiddleware, async (req, res) => {
        try{
            const {startDate, endDate, username} = req.query;
            const result = await dm.transactionByCashier(startDate, endDate, username)
            res.status(200).json({translist: result});
        }catch (error) {
			console.error('Error get transaction by cashier:', error);
			res.status(500).json({message: 'Error get transaction by cashier', log: error});
		}
    })

module.exports = router;
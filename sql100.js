const { db100 } = require('./dbconfig');
const fs = require('fs');
const path = require('path');
const q = JSON.parse(
  fs.readFileSync(path.join(__dirname, './query/100.sql'), 'utf8')
);

async function findUser(username) {
  try {
    const [rows] = await db100.execute(q.auth.searchUsername, [username]);

    if (!rows.length) {
      return null;
    }

    const data = rows[0];
    const [infoRows] = await db100.execute(q.auth.userInfo, [data.id_akun]);

    if (infoRows.length) {
      data.info = infoRows[0];
    } else {
      data.namauser = '';
      data.posisi = '';
    }

    return data;
  } catch (error) {
    console.error('findUser error:', error);
    throw error;
  }
}

async function getGoodsList(){
  try{
    const goodslist = await db100.execute(q.goods.goodsList);
    return goodslist;
  } catch (error) {
    console.error('getGoodsList error:', error);
    throw error;
  }
}

async function getGoodsPricePerGram(id_item){
  try{
    const goodslist = await db100.execute(q.goods.goodsPricePerGram, [id_item]);
    return goodslist;
  } catch (error) {
    console.error('getGoodsList error:', error);
    throw error;
  }
}


module.exports = { findUser, getGoodsList, getGoodsPricePerGram };

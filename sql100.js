const { db100 } = require('./dbconfig');
const fs = require('fs');
const path = require('path');
const q = JSON.parse(
  fs.readFileSync(path.join(__dirname, './query/100.sql'), 'utf8')
);

async function findUser(username, roleid) {
  try {
    const [rows] = await db100.execute(q.auth.searchUsername, [username, roleid]);

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

// fungsi hitungHarga tetap seperti yang kamu punya
function hitungHarga(weight, master) {
  master.sort((a,b) => b.berat - a.berat);

  let sisa = weight;
  let total = 0;
  let detail = [];

  for (let m of master) {
    let qty = Math.floor(sisa / m.berat);
    if (qty > 0) {
      total += qty * m.harga;
      sisa -= qty * m.berat;
      detail.push({berat: m.berat, harga: m.harga, qty, subtotal: qty * m.harga});
    }
  }

  return { total, detail };
}

// fungsi countPricePerItem
async function countPricePerItem(cart) {
  try {
    let results = [];

    for (let item of cart) {
      // ambil master harga dari DB berdasarkan id_item
      const [rows] = await db100.execute(q.goods.getPriceByItem, [item.id_item]);

      // rows akan berupa array [{berat:1000, harga:7000}, {berat:500, harga:4000}, ...]
      const master = rows.map(r => ({
        berat: r.berat,
        harga: r.harga
      }));

      // hitung harga dengan fungsi hitungHarga
      const { total, detail } = hitungHarga(item.totalWeight, master);

      // push hasilnya ke array result
      results.push({
        ...item,            // biar masih ada comodity, id_item, totalWeight
        totalPrice: total,  // hasil hitung
        breakdown: detail   // detail breakdown (opsional untuk ditampilkan di UI)
      });
    }

    return results;
  } catch (error) {
    console.error('countPricePerItem error:', error);
    throw error;
  }
}


module.exports = { findUser, getGoodsList, getGoodsPricePerGram, countPricePerItem };

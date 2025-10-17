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

async function getGoodsList() {
  try {
    const goodslist = await db100.execute(q.goods.goodsList);
    return goodslist;
  } catch (error) {
    console.error('getGoodsList error:', error);
    throw error;
  }
}

async function getGoodsPricePerGram(id_item) {
  try {
    const goodslist = await db100.execute(q.goods.goodsPricePerGram, [id_item]);
    return goodslist;
  } catch (error) {
    console.error('getGoodsList error:', error);
    throw error;
  }
}


function hitungHarga(weight, master) {
  master.sort((a, b) => b.berat - a.berat);

  let sisa = weight;
  let total = 0;
  let detail = [];

  for (let m of master) {
    let qty = Math.floor(sisa / m.berat);
    if (qty > 0) {
      total += qty * m.harga;
      sisa -= qty * m.berat;
      detail.push({ berat: m.berat, harga: m.harga, qty, subtotal: qty * m.harga, idppg: m.idppg, });
    }
  }

  return { total, detail };
}

async function countPricePerItem(cart) {
  try {
    let results = [];

    for (let item of cart) {
      const [rows] = await db100.execute(q.goods.getPriceByItem, [item.id_item]);

      const master = rows.map(r => ({
        berat: r.berat,
        harga: r.harga,
        idppg: r.id_ppg
      }));

      const { total, detail } = hitungHarga(item.totalWeight, master);
      results.push({
        ...item,
        totalPrice: total,
        breakdown: detail
      });
    }

    return results;
  } catch (error) {
    console.error('countPricePerItem error:', error);
    throw error;
  }
}

async function saveSellTransaction(transaction) {
  try {
    const idrole = 3;
    let cashierID, modalItem = 0, profit, voucherid, telepon;
    const transType = 'PENJUALAN';
    // nomor transaksi
    const [genRows] = await db100.execute(q.transaction.genSellNumber);
    const number = genRows[0].trx_no;

    // data dari transaksi
    const itemIds = transaction.items.map(item => item.id_item);
    const items = transaction.items;
    const cashier = transaction.cashier;
    const location = transaction.location;
    const grandTotal = transaction.summary.grandTotal;
    const voucher = transaction.summary.voucherDiscount;
    const phoneNumber = transaction.summary.phoneNumber;
    const idvoucher = transaction.summary.idVoucher;
    const discount = transaction.summary.totalDiscount;
    const payment = transaction.summary.paymentAmount;
    const change = transaction.summary.change;
    
    if(idvoucher){
      voucherid = idvoucher;
    }else{
      voucherid = null;
    }
    
    if(phoneNumber){
      telepon = phoneNumber;
    }else{
      telepon = null;
    }

    // ambil id kasir
    const [cashierRows] = await db100.execute(q.auth.searchUsername, [cashier, idrole]);
    cashierID = cashierRows[0].id_akun;

    // ambil modal tiap item, lalu jumlahkan
    for (const id of itemIds) {
      const [rows] = await db100.execute(q.transaction.getModal, [id]);
      if (rows.length > 0) {
        modalItem += parseFloat(rows[0].modal);
      }
    }

    // hitung profit
    profit = (payment - change) - modalItem;

    // simpan master transaksi
    await db100.execute(q.transaction.insertSellMaster, [
      number, cashierID, location, voucherid, grandTotal, telepon, modalItem, profit, discount, payment, change
    ]);
    
    await db100.execute(q.transaction.burnVoucher, [voucherid]);

    for (const item of items) {
      for (const b of item.breakdown) {
        await db100.execute(q.transaction.insertSellDetail, [
          number,
          b.idppg,
          item.id_item,
          transType,
          b.berat * b.qty,
          b.harga,
          b.subtotal,
          (item.discount || 0) / item.breakdown.length
        ]);
      }
    }

    return { number, cashierID, location, grandTotal, modalItem, profit, discount, payment, change }
  } catch (error) {
    console.error('saveSellTransaction error:', error);
    throw error;
  }
}

async function transactionByCashier(startDate, endDate, username) {
  try {
    const [rows] = await db100.execute(q.transaction.transactionByCashier, [startDate, endDate, username, username]);
    const data = rows;

    return data;
  } catch (error) {
    console.error('transactionByCashier error:', error);
    throw error;
  }
}

async function saveReturTransaction(transaction) {
  try {
    const idrole = 3;
    let cashierID, modalItem = 0, profit;
    const transType = 'PENJUALAN';
    // nomor transaksi
    const [genRows] = await db100.execute(q.transaction.genExcNumber);
    const number = genRows[0].trx_no;

    // data dari transaksi
    const itemIds = transaction.items.map(item => item.id_item);
    const items = transaction.items;
    const cashier = transaction.cashier;
    const location = transaction.location;
    const grandTotal = transaction.summary.grandTotal;
    const discount = transaction.summary.totalDiscount + transaction.summary.tradeInTotal;
    const payment = transaction.summary.paymentAmount;
    const change = transaction.summary.change;

    // ambil id kasir
    const [cashierRows] = await db100.execute(q.auth.searchUsername, [cashier, idrole]);
    cashierID = cashierRows[0].id_akun;

    // ambil modal tiap item, lalu jumlahkan
    for (const id of itemIds) {
      const [rows] = await db100.execute(q.transaction.getModal, [id]);
      if (rows.length > 0) {
        modalItem += parseFloat(rows[0].modal);
      }
    }

    // hitung profit
    profit = (payment - change) - modalItem;

    // simpan master transaksi
    await db100.execute(q.transaction.insertReturSellMaster, [
      number, cashierID, location, grandTotal, modalItem, profit, discount, payment, change
    ]);

    // detail transaksi
    for (const item of items) {
      // ambil daftar harga per gram untuk item ini
      const [hargaRows] = await db100.execute(q.goods.getPriceByItem, [item.id_item]);
    
      let selected = null;
      if (item.totalWeight >= 1000) {
        selected = hargaRows.find(r => r.berat === 1000);
      } else {
        selected = hargaRows.find(r => r.berat <= item.totalWeight);
      }
    
      if (!selected) {
        throw new Error(`Harga per gram tidak ditemukan untuk item ${item.id_item} dengan berat ${item.totalWeight}`);
      }
    
      await db100.execute(q.transaction.insertSellDetail, [
        number,
        selected.id_ppg,      // id_ppg hasil query
        item.id_item,
        item.type,
        item.totalWeight,
        item.originalPrice,
        item.finalPrice,
        item.discount
      ]);
    }

    return { number, cashierID, location, grandTotal, modalItem, profit, discount, payment, change }
  } catch (error) {
    console.error('saveSellTransaction error:', error);
    throw error;
  }
}

async function searchMember(phone) {
  try {
    const [rows] = await db100.execute(q.transaction.searchMember, [phone]);
    const total = Number(rows[0]?.total || 0);

    if (total === 0) {
      await db100.execute(q.transaction.insertMemberByTransaction, [phone, phone]);
    }
    return total;
  } catch (error) {
    console.error('searchMember error:', error);
    throw error;
  }
}


async function getVoucherByPhone(phone) {
  try {
    const [rows] = await db100.execute(q.transaction.getVoucherByPhone, [phone]);
    if (rows.length === 0) {
      return null;
    }
    return {
      id_voucher: rows[0].id_voucher,
      kode_voucher: rows[0].kode_voucher,
      nominal: rows[0].nominal
    };
  } catch (error) {
    console.error('getVoucherByPhone error:', error);
    throw error;
  }
}

module.exports = { 
  findUser, getGoodsList, getGoodsPricePerGram, countPricePerItem, 
  saveSellTransaction, transactionByCashier, saveReturTransaction,
  searchMember, getVoucherByPhone
};
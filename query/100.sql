{
    "auth":{
        "searchUsername" : "SELECT a.* FROM akun as a INNER JOIN akun_has_role as b ON a.id_akun = b.id_akun WHERE a.username = ? AND b.id_role = ?",
        "userInfo" : "SELECT a.nama, a.username, c.role FROM akun as a INNER JOIN akun_has_role as b ON a.id_akun = b.id_akun INNER JOIN role as c ON b.id_role = c.id_role WHERE a.id_akun = ?"
    },
    "goods":{
        "goodsList" : "SELECT a.id_item, a.item as comodity, b.harga_jual as basic_price, d.berat as weight_Gr, c.harga_per_gram as price_per_Gr, a.base64_img as img FROM item as a LEFT OUTER JOIN harga as b ON a.id_item = b.id_item LEFT OUTER JOIN harga_per_gram as c ON b.id_harga = c.id_harga LEFT OUTER JOIN berat as d ON c.id_berat = d.id_berat WHERE d.berat in ('100','250', '500', '1000') AND c.tanggal = (SELECT MAX(c2.tanggal) FROM harga_per_gram AS c2 JOIN harga AS b2 ON c2.id_harga = b2.id_harga WHERE b2.id_item = a.id_item AND c2.id_berat = d.id_berat) ORDER BY a.item ASC",
        "goodsPricePerGram" : "SELECT a.id_item, a.item as comodity, d.berat as weight_Gr, c.harga_per_gram as price_per_Gr FROM item as a LEFT OUTER JOIN harga as b ON a.id_item = b.id_item LEFT OUTER JOIN harga_per_gram as c ON b.id_harga = c.id_harga LEFT OUTER JOIN berat as d ON c.id_berat = d.id_berat WHERE a.id_item = ? AND c.tanggal = (SELECT MAX(c2.tanggal) FROM harga_per_gram AS c2 JOIN harga AS b2 ON c2.id_harga = b2.id_harga WHERE b2.id_item = a.id_item AND c2.id_berat = d.id_berat) ORDER BY a.item ASC",
        "getPriceByItem" : "SELECT c.tanggal, d.berat, c.harga_per_gram AS harga FROM harga h JOIN harga_per_gram c ON h.id_harga = c.id_harga JOIN berat d ON c.id_berat = d.id_berat WHERE h.id_item = ? AND d.berat <= 1000 AND c.tanggal = (SELECT MAX(c2.tanggal) FROM harga_per_gram c2 JOIN harga h2 ON c2.id_harga = h2.id_harga WHERE h2.id_item = h.id_item AND c2.id_berat = d.id_berat) ORDER BY d.berat DESC"
    }
}
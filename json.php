<?php
header("Content-Type: application/json; charset=utf-8");

$t = new DateTime();
$data = file("http://linkdata.org/api/1/rdf1s2442i/donburi_tourism_in_fukui_tsv.txt", FILE_IGNORE_NEW_LINES);
$json = array();
foreach ($data as $line) {
    if ( !preg_match('/^#/', $line) ) {
        $a = explode("\t", $line);
        $json[$a[0]] = array (
            'id'             => $a[0], // ID
            'area'           => $a[1], // エリア
            'municipalities' => $a[2], // 所在地
            'genre'          => $a[3], // ジャンル
            'title'          => $a[4], // 名称
            'subtitle'       => $a[5], // サブタイトル
            'explanation'    => $a[6], // 説明
            'address'        => $a[7], // 住所
            'tel'            => $a[8], // 電話番号
            'url'            => $a[9], // URL
            'open'           => $a[9], // 営業時間
            'closed'         => $a[11], // 定休日
            'notes'          => $a[12], // 備考
            'lat'            => $a[13], // 緯度
            'lng'            => $a[14]    // 経度
        );
    }
}

echo sprintf("donburi_tourism_in_fukui(%s)",json_encode($json));
exit;
?>
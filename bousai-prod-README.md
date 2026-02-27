# 東京防災ナビ v3.0 🗺

東京都向け防災情報Webアプリ（GitHub Pages対応 PWA）

## 機能
- 🏫 **実データ避難所検索** — 東京都オープンデータCSV（CC BY 4.0）直接取得
- 🗺 **ハザードマップ** — 水害・倒壊・液状化・津波リスク表示
- 🚶 **道路沿いルート** — OSRM APIで徒歩最短ルート＋所要時間バッジ
- 🏃 **避難シミュレーション** — 到達時間・消費カロリー・防災アドバイス
- 🌐 **3言語対応** — 日本語 / English / 中文（ブラウザ言語で自動切替）
- ♿ **アクセシビリティ** — フォントサイズ変更・ハイコントラスト・ARIA・キーボード操作
- 📲 **PWA** — ホーム画面追加・オフラインキャッシュ（タイル30日・API10分）

## ファイル構成

```
bousai-navi/
├── index.html      # エントリーポイント（SEO/OGP/ARIA完備）
├── app.css         # スタイル（ハイコントラスト・フォントスケール対応）
├── app.js          # アプリロジック（i18n・Tokyo CSV・OSRM・PWA）
├── sw.js           # Service Worker（GitHub Pagesサブパス対応）
├── manifest.json   # PWAマニフェスト
└── icons/          # ★ 要作成（下記参照）
    ├── icon-192.png
    └── icon-512.png
```

## GitHub Pages デプロイ手順

### 1. リポジトリ作成 & push

```bash
git init
git add .
git commit -m "feat: 東京防災ナビ v3.0"
git remote add origin https://github.com/YOUR_NAME/bousai-navi.git
git push -u origin main
```

### 2. GitHub Pages を有効化

1. リポジトリ → **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `/ (root)`
4. **Save** → 数分後に `https://YOUR_NAME.github.io/bousai-navi/` で公開

### 3. manifest.json の `start_url` を確認

GitHub Pagesのサブパスに合わせて、必要に応じて変更：

```json
"start_url": "/bousai-navi/",
"scope": "/bousai-navi/"
```

> ユーザー名.github.io 直下にデプロイする場合は `"./"` のままでOK。

## アイコン作成（必須）

`icons/` フォルダを作成して配置：

| ファイル | サイズ |
|---------|--------|
| `icon-192.png` | 192×192px |
| `icon-512.png` | 512×512px |

**無料で即作成**: [favicon.io](https://favicon.io/emoji-favicons/world-map/) から絵文字 🗺 を選択してダウンロード → リネームして配置。

## 使用API（すべて無料・登録不要）

| API | 用途 | 利用規約 |
|-----|------|----------|
| 東京都オープンデータ | 実際の指定避難所データ | CC BY 4.0（帰属表示必要） |
| OpenStreetMap | 地図タイル | ODbL |
| Overpass API | 避難所補完（CSV不足時） | ODbL |
| OSRM | 徒歩ルート計算 | BSD 2-Clause |
| Nominatim | 住所・駅名検索 | ODbL |

## 帰属表示（必須 / CC BY 4.0）

アプリ内の `data-credit` 要素に表示済み：
```
避難所データ：東京都オープンデータ (CC BY 4.0)
```

## アクセシビリティ対応内容

- フォントサイズ変更（100%〜140%、設定保存）
- ハイコントラストモード（設定保存）
- 全操作要素にARIAラベル付与
- キーボード操作対応（Tab/Enter/Space/Escape）
- スクリーンリーダー対応（aria-live, role=alert）
- スキップリンク（キーボードユーザー向け）
- `max-scale=5.0` でピンチズームを許可（`user-scalable=no` を削除）
- 車椅子対応避難所に ♿ バッジ表示

## 将来の拡張ロードマップ

- [ ] 全国対応（国土地理院API連携）
- [ ] 気象庁API連携（リアルタイム警報）
- [ ] 避難所混雑情報（行政API連携）
- [ ] 韓国語・ポルトガル語・やさしい日本語
- [ ] 音声読み上げナビ

## ライセンス

MIT License — ただし東京都オープンデータの帰属表示は必須（CC BY 4.0）

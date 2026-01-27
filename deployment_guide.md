# Kotodama Server Deployment Guide (Self-Hosting) 🏰

このガイドでは、Kotodamaを自分のサーバー（VPS）で動かすための「完全手順（ゼロからスタート）」を解説します。
今回は、**「ずっと無料（Always Free）」** で最強のスペックを誇る **Oracle Cloud** を例に進めますが、AWSやConoHa VPSでも「Ubuntu」を選べば手順はほぼ同じです。

---

## Step 1: サーバー（土地）を手に入れる 🗺️

1.  **Oracle Cloud Free Tier に登録**
    *   [Oracle Cloud](https://www.oracle.com/cloud/free/) から登録します（クレジットカード登録が必要ですが、有料枠を使わない限り請求されません）。
2.  **VMインスタンスを作成**
    *   ダッシュボードから「Create a VM instance」を選択。
    *   **Image**: `Ubuntu 22.04` (または 24.04) を選択。
    *   **Shape (重要)**: `Ampere (ARM)` プロセッサの `VM.Standard.A1.Flex` を選択。
        *   **CPU**: 4 OCPU
        *   **Memory**: 24 GB
        *   これが無料で使える最強設定です。
3.  **SSHキーの保存 (超重要)**
    *   「Add SSH keys」の項目で **「Save Private Key」** をクリックし、`ssh-key-xxxxxxxx.key` ファイルをPCに保存します。
    *   **絶対に紛失しないでください**。これがサーバーへの「鍵」です。
4.  **作成完了**
    *   数分でサーバーが立ち上がります。「Public IP Address (パブリックIP)」(例: `123.45.67.89`) をメモしてください。

---

## Step 2: サーバーに入る (SSH接続) 🚪

ターミナル（MacならTerminalアプリ）を開いて作業します。

1.  **鍵の権限設定**（初回のみ）
    ```bash
    # ダウンロードフォルダにある鍵を .ssh フォルダに移動（任意）
    mv ~/Downloads/ssh-key-xxxx.key ~/.ssh/oracle_key.key
    
    # 他人が触れないように権限を変更（必須）
    chmod 400 ~/.ssh/oracle_key.key
    ```

2.  **接続**
    ```bash
    # ssh -i [鍵ファイル] [ユーザー名]@[IPアドレス]
    ssh -i ~/.ssh/oracle_key.key ubuntu@123.45.67.89
    ```
    *   `Are you sure...?` と聞かれたら `yes` と入力。
    *   `ubuntu@instance-xxx:~$` のような表示になればログイン成功です！

---

## Step 3: 基礎工事 (Dockerのインストール) 🏗️

サーバーの中で以下のコマンドを1行ずつ実行します。

```bash
# 1. システムの更新
sudo apt update && sudo apt upgrade -y

# 2. Dockerのインストール
sudo apt install docker.io -y

# 3. Docker Composeのプラグインインストール
sudo apt install docker-compose-v2 -y

# 4. Dockerを自動起動設定
sudo systemctl enable docker
sudo systemctl start docker

# 5. 現在のユーザー(ubuntu)がsudoなしでDockerを使えるようにする
sudo usermod -aG docker $USER

# 6. 一旦ログアウトして設定を反映
exit
```
**再度Step 2の手順でSSHログインしてください。**

---

## Step 4: Kotodamaの建設 (デプロイ) ⛩️

ついにアプリケーションを立ち上げます。

1.  **ソースコードのダウンロード**
    ```bash
    git clone https://github.com/naki0227/kotodama.git
    cd kotodama
    ```

2.  **環境変数の設定**
    ```bash
    nano .env
    ```
    *   画面が切り替わるので、以下のように書き込みます（キーは自分のものに書き換えてください）。
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=AIzr......
    NEXT_PUBLIC_SUPABASE_URL=https://......
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ......
    ```
    *   **保存方法**: `Ctrl + O` → `Enter` → `Ctrl + X`

3.  **起動！**
    ```bash
    docker compose up -d --build
    ```
    *   これだけで、自動的に部品（コンテナ）が組み立てられ、サーバーが起動します。

---

## Step 5: 道を開通する (ポート開放) 🚧

Oracle Cloudなどのクラウドには「ファイアウォール」があり、初期状態ではWebアクセスが遮断されています。

1.  **Oracle Cloudの管理画面**に戻る
2.  インスタンスの詳細ページ → 「Virtual Cloud Network (VCN)」のリンクをクリック
3.  「Security Lists」→「Default Security List...」をクリック
4.  「Add Ingress Rules」をクリック
    *   **Source CIDR**: `0.0.0.0/0` (どこからでも)
    *   **Destination Port Range**: `3000`
5.  **サーバー内部のファイアウォールも許可**（SSH側のターミナルで実行）
    ```bash
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
    sudo netfilter-persistent save
    ```

---


---

## Step 6: 独自ドメイン & HTTPS化 (セキュリティ強化) 🔒✨

`http://217...:3000` ではなく `https://kotodama-ai.com` のように安全なURLでアクセスできるようにします。

### 1. ドメインの設定 (DNS)
ドメイン管理画面（Xserverドメインなど）で「DNSレコード」を追加します。
- **種別**: `A`
- **内容**: サーバーのIPアドレス (`217.142.241.242`)

※ 反映されるまで時間がかかる場合があります。

### 2. HTTPS化 (Caddyの導入)
サーバー内の `docker-compose.yml` にCaddy（自動HTTPS化ツール）を追加します。

1. **ファイアウォール開放 (80/443)**
   Oracle CloudのSecurity Listと、サーバー設定(`iptables`)の両方で `80` と `443` ポートを開けてください。

2. **Caddyfileの作成**
   ```text
   kotodama-ai.com {
       reverse_proxy web:3000
   }
   ```

3. **再起動**
   ```bash
   sudo docker compose up -d --build --remove-orphans
   ```

---

## 🔄 運用マニュアル: 新機能の追加・更新方法 🛠️

機能を追加・修正したあと、本番サーバーに反映させる手順です。

### 1. 開発 & プッシュ (自分のPC)
コードを修正したら、GitHubに送信します。
```bash
git add .
git commit -m "新機能追加"
git push origin main
```

### 2. サーバーにログイン
```bash
ssh -i ~/.ssh/oracle_key.key ubuntu@217.142.241.242
```

### 3. 最新コードの取り込み & 再起動 (サーバー内)
```bash
cd kotodama
git pull origin main
sudo docker compose up -d --build --remove-orphans
```

*   **解説**:
    *   `git pull`: GitHubから最新の変更をダウンロードします。
    *   `docker compose up -d --build`: Dockerコンテナを作り直して起動します。
    *   `--remove-orphans`: 古い設定のゴミを削除します。

🎉 これで数分後には、新しい機能が世界中に公開されます！

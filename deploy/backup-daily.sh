#!/usr/bin/env bash
# 每天 03:20 由 cron 调用：dump 博客库 + 打包上传目录，保留 14 天。
set -euo pipefail

DIR=/opt/blog
STAMP=$(date +%F)

mkdir -p "$DIR/backups"

docker exec promptvault-ecs-db-1 pg_dump -U promptvault blog | gzip > "$DIR/backups/blog-$STAMP.sql.gz"

find "$DIR/data/uploads" -type f 2>/dev/null | grep -q . && tar -czf "$DIR/backups/uploads-$STAMP.tar.gz" -C "$DIR/data" uploads

# 哪吁监控（dashboard SQLite + TSDB 历史）
tar -czf "$DIR/backups/nezha-$STAMP.tar.gz" -C /opt/nezha data

find "$DIR/backups" -name 'blog-*.sql.gz' -mtime +14 -delete
find "$DIR/backups" -name 'uploads-*.tar.gz' -mtime +14 -delete
find "$DIR/backups" -name 'nezha-*.tar.gz' -mtime +14 -delete

echo "$(date -Is) backup ok"

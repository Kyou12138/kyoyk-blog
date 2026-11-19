#!/usr/bin/env bash
# 每天 03:20 由 cron 调用：dump 博客库 + 打包上传目录，保留 14 天。
set -euo pipefail

DIR=/opt/blog
STAMP=$(date +%F)

umask 077
mkdir -p "$DIR/backups"

docker exec promptvault-ecs-db-1 pg_dump -U promptvault blog | gzip > "$DIR/backups/blog-$STAMP.sql.gz"

find "$DIR/data/uploads" -type f 2>/dev/null | grep -q . && tar -czf "$DIR/backups/uploads-$STAMP.tar.gz" -C "$DIR/data" uploads

# 哪吒的 SQLite 与 TSDB 必须来自同一停写时点，避免热打包产生不可恢复的备份。
if [ -d /opt/nezha/data ]; then
  if [ "$(docker inspect -f '{{.State.Running}}' nezha-dashboard)" = true ]; then
    trap 'docker start nezha-dashboard >/dev/null' EXIT
    docker stop -t 30 nezha-dashboard >/dev/null
    tar -czf "$DIR/backups/nezha-$STAMP.tar.gz" -C /opt/nezha data
    docker start nezha-dashboard >/dev/null
    trap - EXIT
  else
    tar -czf "$DIR/backups/nezha-$STAMP.tar.gz" -C /opt/nezha data
  fi
fi

find "$DIR/backups" -name 'blog-*.sql.gz' -mtime +14 -delete
find "$DIR/backups" -name 'uploads-*.tar.gz' -mtime +14 -delete
find "$DIR/backups" -name 'nezha-*.tar.gz' -mtime +14 -delete

echo "$(date -Is) backup ok"

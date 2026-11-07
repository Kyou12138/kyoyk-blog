#!/usr/bin/env bash
# 在 ECS 的 /opt/blog 下执行：拉代码 → 重新构建镜像 → 重启容器。
set -euo pipefail

cd /opt/blog

if [ -d .git ]; then
  git fetch --depth=1 origin "${BRANCH:-main}"
  git reset --hard "origin/${BRANCH:-main}"
fi

docker compose -f deploy/compose.ecs.yaml --env-file .env up -d --build

sleep 5
docker compose -f deploy/compose.ecs.yaml ps
curl -fsS -m 10 http://127.0.0.1:3000 >/dev/null 2>&1 \
  || docker exec blog-app-1 wget -qO- http://127.0.0.1:3000 >/dev/null
echo "deployed"

#!/bin/sh
set -eu

deploy_dir=/opt/ninjas-x
site_conf=/etc/nginx/sites-available/ninjas.baibakovkir.space
site_link=/etc/nginx/sites-enabled/ninjas.baibakovkir.space

if ! command -v nginx >/dev/null 2>&1 || ! command -v certbot >/dev/null 2>&1; then
  echo "Nginx and Certbot must be installed before deployment." >&2
  exit 1
fi

install -m 644 "$deploy_dir/nginx-site.conf" "$site_conf"
ln -sfn "$site_conf" "$site_link"
nginx -t
systemctl reload nginx

if [ ! -s /etc/letsencrypt/live/ninjas.baibakovkir.space/fullchain.pem ]; then
  certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect -d ninjas.baibakovkir.space
fi
